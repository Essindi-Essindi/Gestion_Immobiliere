package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.ChangePasswordRequest;
import customer_complaint.gestion_immobiliere.dto.LoginRequest;
import customer_complaint.gestion_immobiliere.dto.LoginResponse;
import customer_complaint.gestion_immobiliere.dto.RefreshRequest;
import customer_complaint.gestion_immobiliere.exception.CompteSuspendu;
import customer_complaint.gestion_immobiliere.exception.CompteVerrouille;
import customer_complaint.gestion_immobiliere.exception.PlateformeEnMaintenance;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.model.JournalAudit;
import customer_complaint.gestion_immobiliere.repository.AdminRepository;
import customer_complaint.gestion_immobiliere.repository.BailleurRepository;
import customer_complaint.gestion_immobiliere.repository.LocataireRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

// volontairement sans @Transactional : un echec ne doit pas annuler le compteur de tentatives
// deliberately not @Transactional: a failure must not roll back the attempt counter
@Service
public class ServiceAuthentificationImpl implements ServiceAuthentification {

    private record Identite(Long id, String role, String email, String first_name, String last_name,
                            String password, boolean must_change, boolean active) {
    }

    private final AdminRepository admin_repository;
    private final BailleurRepository bailleur_repository;
    private final LocataireRepository locataire_repository;
    private final PasswordEncoder password_encoder;
    private final ServiceVerrouillage service_verrouillage;
    private final ServiceSession service_session;
    private final ServiceMotDePasse service_mot_de_passe;
    private final JetonService jeton_service;
    private final EnvoiEmail envoi_email;
    private final UtilisateurCourant utilisateur;
    private final ServiceAudit service_audit;
    private final ServiceParametres service_parametres;
    private final String dummy_hash;

    public ServiceAuthentificationImpl(AdminRepository admin_repository, BailleurRepository bailleur_repository,
                                       LocataireRepository locataire_repository, PasswordEncoder password_encoder,
                                       ServiceVerrouillage service_verrouillage, ServiceSession service_session,
                                       ServiceMotDePasse service_mot_de_passe, JetonService jeton_service,
                                       EnvoiEmail envoi_email, UtilisateurCourant utilisateur,
                                       ServiceAudit service_audit, ServiceParametres service_parametres) {
        this.admin_repository = admin_repository;
        this.bailleur_repository = bailleur_repository;
        this.locataire_repository = locataire_repository;
        this.password_encoder = password_encoder;
        this.service_verrouillage = service_verrouillage;
        this.service_session = service_session;
        this.service_mot_de_passe = service_mot_de_passe;
        this.jeton_service = jeton_service;
        this.envoi_email = envoi_email;
        this.utilisateur = utilisateur;
        this.service_audit = service_audit;
        this.service_parametres = service_parametres;
        // hash bidon pour que "e-mail inconnu" coute le meme temps que "mauvais mot de passe"
        // dummy hash so "unknown email" takes as long as "wrong password"
        this.dummy_hash = password_encoder.encode("dummy-password-for-timing");
    }

    @Override
    public LoginResponse log_in(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        try {
            service_verrouillage.verifier(email);
        } catch (CompteVerrouille e) {
            journal_connexion("ANONYME", null, email, "LOGIN_BLOQUE", "Trop de tentatives échouées");
            throw e;
        }

        Optional<Identite> compte = trouver_par_email(email);
        boolean hash_ok = password_encoder.matches(request.password(),
                compte.map(Identite::password).orElse(dummy_hash));
        if (compte.isEmpty() || !hash_ok) {
            service_verrouillage.echec(email);
            journal_connexion("ANONYME", null, email, "LOGIN_ECHEC", "Identifiants incorrects");
            throw new BadCredentialsException("Identifiants incorrects");
        }

        Identite identite = compte.get();
        // le mot de passe est correct : on peut expliquer le refus sans reveler l'existence du compte a un inconnu
        // password is correct: the refusal can be explained without revealing the account to a stranger
        if (!identite.active()) {
            journal_connexion(identite.role(), identite.id(), identite.email(), "LOGIN_REFUSE", "Compte suspendu");
            throw new CompteSuspendu();
        }
        verifier_maintenance(identite, "LOGIN_REFUSE");

        service_verrouillage.succes(email);
        LoginResponse reponse = reponse(identite, service_session.creer(identite.role(), identite.id()));
        // nom de la personne (pas son e-mail) dans le journal / the person's name (not their email) in the log
        service_audit.journal_pour(identite.role(), identite.id(), identite.first_name() + " " + identite.last_name(),
                JournalAudit.login, "LOGIN_REUSSI", "Connexion réussie (" + identite.email() + ")", identite.role(),
                identite.id());
        return reponse;
    }

    @Override
    public LoginResponse refresh(RefreshRequest request) {
        ServiceSession.Session session = service_session.renouveler(request.refresh_token());
        Optional<Identite> compte = charger(session.role(), session.account_id());
        // edge case: compte supprime entre-temps / account deleted in the meantime
        if (compte.isEmpty()) {
            service_session.revoquer(session.token());
            throw new BadCredentialsException("Compte introuvable");
        }
        // suspension ou maintenance survenues depuis la connexion / suspension or maintenance since the login
        if (!compte.get().active()) {
            service_session.revoquer(session.token());
            throw new CompteSuspendu();
        }
        verifier_maintenance(compte.get(), "LOGIN_REFUSE");
        return reponse(compte.get(), session);
    }

    // premiere connexion d'un locataire, ou changement volontaire ; renvoie de nouveaux jetons
    // first login of a tenant, or voluntary change; returns fresh tokens
    @Override
    public LoginResponse change_password(ChangePasswordRequest request) {
        Identite identite = charger(utilisateur.role(), utilisateur.id())
                .orElseThrow(() -> new BadCredentialsException("Compte introuvable"));
        service_verrouillage.verifier(identite.email());

        // le mot de passe actuel est reverifie : un jeton vole ne suffit pas / current password re-checked
        if (!password_encoder.matches(request.current_password(), identite.password())) {
            service_verrouillage.echec(identite.email());
            throw new RequeteInvalide("Mot de passe actuel incorrect");
        }
        if (request.new_password().equals(request.current_password())) {
            throw new RequeteInvalide("Le nouveau mot de passe doit être différent de l'ancien");
        }
        service_verrouillage.succes(identite.email());

        service_mot_de_passe.definir(identite.role(), identite.id(), password_encoder.encode(request.new_password()));
        envoi_email.envoyer_alerte_mot_de_passe(identite.email());
        service_audit.journal(JournalAudit.update, "MOT_DE_PASSE_MODIFIE", "Mot de passe changé par l'utilisateur",
                identite.role(), identite.id());

        // toutes les sessions ont ete coupees par definir() : on en ouvre une neuve / all sessions were killed, open a new one
        Identite maj = charger(identite.role(), identite.id())
                .orElseThrow(() -> new BadCredentialsException("Compte introuvable"));
        return reponse(maj, service_session.creer(maj.role(), maj.id()));
    }

    @Override
    public void log_out(RefreshRequest request) {
        service_session.revoquer(request.refresh_token());
    }

    // seuls les admins passent pendant une maintenance / only admins get through during maintenance
    private void verifier_maintenance(Identite identite, String action) {
        if (!"ADMIN".equals(identite.role()) && service_parametres.maintenance()) {
            journal_connexion(identite.role(), identite.id(), identite.email(), action, "Plateforme en maintenance");
            throw new PlateformeEnMaintenance();
        }
    }

    private void journal_connexion(String role, Long id, String email, String action, String details) {
        service_audit.journal_pour(role, id, email, JournalAudit.login, action, details, role, id);
    }

    private LoginResponse reponse(Identite i, ServiceSession.Session session) {
        String access = jeton_service.creer(i.role(), i.id(), i.email(), session.id(), i.must_change());
        return new LoginResponse(access, session.token(), "Bearer", jeton_service.expires_in(), i.id(), i.role(),
                i.email(), i.first_name(), i.last_name(), i.must_change());
    }

    private Optional<Identite> trouver_par_email(String email) {
        return admin_repository.findByEmail(email)
                .map(a -> new Identite(a.getId(), "ADMIN", a.getEmail(), a.getFirst_name(), a.getLast_name(),
                        a.getPassword(), false, true))
                .or(() -> bailleur_repository.findByEmail(email)
                        .map(b -> new Identite(b.getId(), "BAILLEUR", b.getEmail(), b.getFirst_name(),
                                b.getLast_name(), b.getPassword(), false, b.isActive())))
                .or(() -> locataire_repository.findByEmail(email)
                        .map(l -> new Identite(l.getId(), "LOCATAIRE", l.getEmail(), l.getFirst_name(),
                                l.getLast_name(), l.getPassword(), l.isMust_change_password(), l.isActive())));
    }

    private Optional<Identite> charger(String role, Long id) {
        return switch (role) {
            case "ADMIN" -> admin_repository.findById(id)
                    .map(a -> new Identite(a.getId(), role, a.getEmail(), a.getFirst_name(), a.getLast_name(),
                            a.getPassword(), false, true));
            case "BAILLEUR" -> bailleur_repository.findById(id)
                    .map(b -> new Identite(b.getId(), role, b.getEmail(), b.getFirst_name(), b.getLast_name(),
                            b.getPassword(), false, b.isActive()));
            case "LOCATAIRE" -> locataire_repository.findById(id)
                    .map(l -> new Identite(l.getId(), role, l.getEmail(), l.getFirst_name(), l.getLast_name(),
                            l.getPassword(), l.isMust_change_password(), l.isActive()));
            default -> Optional.empty();
        };
    }
}
