package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.model.JournalAudit;
import customer_complaint.gestion_immobiliere.model.ResetToken;
import customer_complaint.gestion_immobiliere.repository.AdminRepository;
import customer_complaint.gestion_immobiliere.repository.BailleurRepository;
import customer_complaint.gestion_immobiliere.repository.LocataireRepository;
import customer_complaint.gestion_immobiliere.repository.ResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceMotDePasse {

    private record Cible(Long id, String role) {
    }

    private final AdminRepository admin_repository;
    private final BailleurRepository bailleur_repository;
    private final LocataireRepository locataire_repository;
    private final ResetTokenRepository reset_repository;
    private final PasswordEncoder password_encoder;
    private final ServiceSession service_session;
    private final ServiceVerrouillage service_verrouillage;
    private final LimiteurDebit limiteur_debit;
    private final EnvoiEmail envoi_email;
    private final ServiceAudit service_audit;

    @Value("${app.reset.minutes:30}")
    private long reset_minutes;

    @Value("${app.cors.origin:http://localhost:4200}")
    private String frontend_url;

    // Asynchrone : la reponse part avant tout travail, donc meme delai que le compte existe ou non
    // Async: the response leaves before any work, so same latency whether or not the account exists
    @Async
    @Transactional
    public void demander(String email_brut) {
        try {
            String email = email_brut.trim().toLowerCase();
            // anti "mail bombing" : 3 demandes par heure et par e-mail, sans rien reveler
            if (limiteur_debit.essayer("reset-mail:" + email, 3, Duration.ofHours(1)) > 0) {
                return;
            }
            Optional<Cible> cible = trouver(email);
            if (cible.isEmpty()) {
                return;
            }
            String token = nouveau_jeton(cible.get().role(), cible.get().id(), Duration.ofMinutes(reset_minutes));
            envoi_email.envoyer_reinitialisation(email, lien("/reset-password", token), reset_minutes);
        } catch (RuntimeException e) {
            log.error("Échec du traitement d'une demande de réinitialisation", e);
        }
    }

    // un seul jeton valide par compte : les anciens sont invalides / one valid token per account
    @Transactional
    public String nouveau_jeton(String role, Long account_id, Duration validite) {
        reset_repository.invalidate_all(account_id, role);
        String token = Hachage.jeton_aleatoire();
        ResetToken reset = new ResetToken();
        reset.setToken_hash(Hachage.sha256(token));
        reset.setAccount_id(account_id);
        reset.setRole(role);
        reset.setExpires_at(Instant.now().plus(validite));
        reset_repository.save(reset);
        return token;
    }

    public String lien(String chemin, String token) {
        return frontend_url + chemin + "?token=" + token;
    }

    // sert au lien "mot de passe oublie" ET au lien d'invitation d'un locataire / serves both forgot and invitation links
    @Transactional
    public void reinitialiser(String token, String nouveau_mot_de_passe) {
        ResetToken reset = reset_repository.find_by_hash(Hachage.sha256(token))
                .filter(t -> !t.isUsed() && t.getExpires_at().isAfter(Instant.now()))
                .orElseThrow(() -> new RequeteInvalide("Lien invalide ou expiré"));

        String email = definir(reset.getRole(), reset.getAccount_id(), password_encoder.encode(nouveau_mot_de_passe));
        if (email == null) {
            throw new RequeteInvalide("Lien invalide ou expiré");
        }
        reset.setUsed(true);
        service_audit.journal_pour(reset.getRole(), reset.getAccount_id(), email, JournalAudit.update,
                "MOT_DE_PASSE_REINITIALISE", "Réinitialisation par lien (" + reset.getRole() + ")", reset.getRole(),
                reset.getAccount_id());
        envoi_email.envoyer_alerte_mot_de_passe(email);
    }

    // applique le nouveau hash, coupe les sessions, leve blocage et obligation de changement
    // applies the new hash, kills sessions, clears lock and forced-change flag ; retourne l'e-mail ou null
    @Transactional
    public String definir(String role, Long account_id, String hash) {
        String email = switch (role) {
            case "ADMIN" -> admin_repository.findById(account_id).map(a -> {
                a.setPassword(hash);
                return a.getEmail();
            }).orElse(null);
            case "BAILLEUR" -> bailleur_repository.findById(account_id).map(b -> {
                b.setPassword(hash);
                return b.getEmail();
            }).orElse(null);
            case "LOCATAIRE" -> locataire_repository.findById(account_id).map(l -> {
                l.setPassword(hash);
                l.setMust_change_password(false);
                return l.getEmail();
            }).orElse(null);
            default -> null;
        };
        if (email != null) {
            reset_repository.invalidate_all(account_id, role);
            service_session.revoquer_compte(role, account_id);
            service_verrouillage.succes(email);
        }
        return email;
    }

    private Optional<Cible> trouver(String email) {
        return admin_repository.findByEmail(email).map(a -> new Cible(a.getId(), "ADMIN"))
                .or(() -> bailleur_repository.findByEmail(email).map(b -> new Cible(b.getId(), "BAILLEUR")))
                .or(() -> locataire_repository.findByEmail(email).map(l -> new Cible(l.getId(), "LOCATAIRE")));
    }
}
