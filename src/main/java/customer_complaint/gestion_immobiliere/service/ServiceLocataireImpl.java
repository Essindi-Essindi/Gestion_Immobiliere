package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.ContratResponse;
import customer_complaint.gestion_immobiliere.dto.LocataireRequest;
import customer_complaint.gestion_immobiliere.dto.LocataireResponse;
import customer_complaint.gestion_immobiliere.dto.SignalementRequest;
import customer_complaint.gestion_immobiliere.dto.SignalementResponse;
import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Bailleur;
import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Logement;
import customer_complaint.gestion_immobiliere.model.Signalement;
import customer_complaint.gestion_immobiliere.repository.BailleurRepository;
import customer_complaint.gestion_immobiliere.repository.ContratRepository;
import customer_complaint.gestion_immobiliere.repository.LocataireRepository;
import customer_complaint.gestion_immobiliere.repository.LogementRepository;
import customer_complaint.gestion_immobiliere.repository.SignalementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceLocataireImpl implements ServiceLocataire {

    private final ServiceAudit service_audit;
    private final LocataireRepository locataire_repository;
    private final BailleurRepository bailleur_repository;
    private final LogementRepository logement_repository;
    private final ContratRepository contrat_repository;
    private final SignalementRepository signalement_repository;
    private final VerificationEmail verification_email;
    private final PasswordEncoder password_encoder;
    private final UtilisateurCourant utilisateur;
    private final ServiceMotDePasse service_mot_de_passe;
    private final EnvoiEmail envoi_email;
    private final ServiceNotification service_notification;
    private final AffectationPiece affectation;

    @Value("${app.invitation.hours:72}")
    private long invitation_hours;

    // Deux modes / two modes :
    //  - sans mot de passe : invitation, le locataire le choisit via un lien a usage unique (le bailleur ne connait rien)
    //  - avec mot de passe : mot de passe temporaire, a changer obligatoirement a la premiere connexion
    @Override
    public LocataireResponse create(LocataireRequest request) {
        String email = verification_email.normaliser(request.email());
        verification_email.assurer_libre(email);

        Bailleur invitant = utilisateur.bailleur()
                ? bailleur_repository.findById(utilisateur.id())
                        .orElseThrow(() -> new RessourceIntrouvable("Bailleur introuvable"))
                : null;
        boolean invitation = request.password() == null;

        Locataire locataire = new Locataire();
        locataire.setEmail(email);
        // en mode invitation le hash vient d'une valeur aleatoire jetee : personne ne peut se connecter avant le lien
        locataire.setPassword(password_encoder.encode(invitation ? Hachage.jeton_aleatoire() : request.password()));
        locataire.setMust_change_password(true);
        // le bailleur qui cree le compte en devient "proprietaire" / the creating landlord owns the tenant
        locataire.setBailleur(invitant);
        Logement logement = logement_autorise(request.logement_id());
        locataire.setLogement(logement);
        appliquer(locataire, request);
        Locataire cree = locataire_repository.save(locataire);
        if (request.piece_id() != null) {
            if (logement == null) {
                throw new RequeteInvalide("Choisissez un logement avant de choisir une chambre");
            }
            affectation.affecter(cree, logement, request.piece_id());
        }

        String nom_invitant = invitant != null
                ? invitant.getFirst_name() + " " + invitant.getLast_name()
                : "Votre gestionnaire";
        if (invitation) {
            String token = service_mot_de_passe.nouveau_jeton("LOCATAIRE", cree.getId(),
                    Duration.ofHours(invitation_hours));
            envoi_email.envoyer_invitation(email, nom_invitant, service_mot_de_passe.lien("/set-password", token),
                    invitation_hours);
        } else {
            envoi_email.envoyer_compte_cree(email, nom_invitant);
        }
        service_audit.creation("LOCATAIRE", cree.getId(), "Locataire " + cree.getFirst_name() + " " + cree.getLast_name());
        return LocataireResponse.from(cree);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocataireResponse> list(Long logement_id) {
        List<Locataire> locataires = utilisateur.bailleur()
                ? locataire_repository.list_pour_bailleur(utilisateur.id())
                : locataire_repository.findAll();
        return locataires.stream()
                .filter(l -> logement_id == null || (l.getLogement() != null && l.getLogement().getId().equals(logement_id)))
                .map(LocataireResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LocataireResponse get(Long id) {
        return LocataireResponse.from(visible(id));
    }

    @Override
    public LocataireResponse update(Long id, LocataireRequest request) {
        Locataire locataire = visible(id);
        String email = verification_email.normaliser(request.email());
        boolean reinviter = false;
        if (!email.equals(locataire.getEmail())) {
            // un bailleur ne peut pas rediriger l'e-mail d'un compte actif : "mot de passe oublie" = prise de controle
            // a landlord cannot redirect an active account's email: forgot-password would be a takeover
            if (!utilisateur.admin() && !locataire.isMust_change_password()) {
                throw new AccessDeniedException("L'e-mail d'un compte actif ne peut pas être modifié par le bailleur");
            }
            verification_email.assurer_libre(email);
            locataire.setEmail(email);
            reinviter = locataire.isMust_change_password();
        }
        // le mot de passe n'est jamais modifiable ici : voir "mot de passe oublie" / never editable here: use forgot-password
        // rattachement a un autre logement : impossible tant qu un contrat est en cours / re-attaching is blocked while a contract is ongoing
        if (request.logement_id() != null && (locataire.getLogement() == null
                || !locataire.getLogement().getId().equals(request.logement_id()))) {
            if (contrat_repository.find_by_locataire(id).stream().anyMatch(ContratResponse::est_actif)) {
                throw new ConflitDonnees("Le locataire a un contrat en cours : impossible de le rattacher à un autre logement");
            }
            // nouveau logement : l ancienne chambre n a plus de sens / new home: the old room no longer applies
            affectation.liberer(locataire);
            locataire.setLogement(logement_autorise(request.logement_id()));
        }
        // edge case: piece absente = chambre inchangee (liberer via le logement) / no room = unchanged
        if (request.piece_id() != null) {
            if (locataire.getLogement() == null) {
                throw new RequeteInvalide("Choisissez un logement avant de choisir une chambre");
            }
            affectation.affecter(locataire, locataire.getLogement(), request.piece_id());
        }
        appliquer(locataire, request);
        Locataire maj = locataire_repository.save(locataire);

        // compte pas encore active : l'ancien lien est annule, une nouvelle invitation part a la nouvelle adresse
        if (reinviter) {
            String token = service_mot_de_passe.nouveau_jeton("LOCATAIRE", maj.getId(),
                    Duration.ofHours(invitation_hours));
            String invitant = maj.getBailleur() != null
                    ? maj.getBailleur().getFirst_name() + " " + maj.getBailleur().getLast_name()
                    : "Votre gestionnaire";
            envoi_email.envoyer_invitation(email, invitant, service_mot_de_passe.lien("/set-password", token),
                    invitation_hours);
        }
        service_audit.modification("LOCATAIRE", maj.getId(), "Locataire " + maj.getFirst_name() + " " + maj.getLast_name() + " modifié");
        return LocataireResponse.from(maj);
    }

    @Override
    public void delete(Long id) {
        Locataire locataire = visible(id);
        if (!locataire.getContrats().isEmpty() || !locataire.getSignalements().isEmpty()) {
            throw new ConflitDonnees("Impossible de supprimer un locataire qui a des contrats ou des signalements");
        }
        locataire_repository.delete(locataire);
        service_audit.suppression("LOCATAIRE", id, "Locataire " + locataire.getFirst_name() + " " + locataire.getLast_name());
    }

    @Override
    public SignalementResponse report_issue(Long id, SignalementRequest request) {
        Locataire locataire = visible(id);
        Logement logement = logement_repository.findById(request.logement_id())
                .orElseThrow(() -> new RessourceIntrouvable("Logement introuvable : " + request.logement_id()));
        // le locataire doit etre rattache au logement / tenant must be linked to the home
        if (!contrat_repository.locataire_lie_au_logement(id, logement.getId())) {
            throw new RequeteInvalide("Le locataire n'est pas rattaché à ce logement");
        }

        Signalement signalement = new Signalement();
        signalement.setTitle(request.title());
        signalement.setDescription(request.description());
        if (request.priority() != null) {
            signalement.setPriority(request.priority());
        }
        signalement.setCategory(request.category());
        signalement.setPhoto(request.photo());
        signalement.setLocataire(locataire);
        signalement.setLogement(logement);
        Signalement cree = signalement_repository.save(signalement);
        // le bailleur du logement est prevenu / the home landlord is notified
        boolean urgent = "HAUTE".equals(cree.getPriority()) || "URGENTE".equals(cree.getPriority());
        service_notification.creer("BAILLEUR", logement.getBailleur().getId(), urgent ? "ALERT" : "INFO",
                "Nouveau signalement",
                locataire.getFirst_name() + " " + locataire.getLast_name() + " a signalé : "
                        + (cree.getTitle() != null ? cree.getTitle() : cree.getCategory()) + " (priorité "
                        + cree.getPriority() + ") - " + logement.getAddress(),
                "SIGNALEMENT", cree.getId());
        service_audit.creation("SIGNALEMENT", cree.getId(), "Signalement « " + (cree.getTitle() != null ? cree.getTitle() : cree.getCategory()) + " » sur " + logement.getAddress());
        return SignalementResponse.from(cree);
    }

    @Override
    @Transactional(readOnly = true)
    public ContratResponse view_contract(Long id) {
        visible(id);
        List<Contrat> contrats = contrat_repository.find_by_locataire(id);
        // un bailleur ne voit que ses propres contrats avec ce locataire / a landlord only sees their own contracts
        if (utilisateur.bailleur()) {
            contrats = contrats.stream().filter(c -> c.getBailleur().getId().equals(utilisateur.id())).toList();
        }
        if (contrats.isEmpty()) {
            throw new RessourceIntrouvable("Aucun contrat pour ce locataire");
        }
        return ContratResponse.from(contrats.get(0));
    }

    // le logement doit appartenir au bailleur connecte (404 sinon) / the home must belong to the logged-in landlord
    private Logement logement_autorise(Long logement_id) {
        if (logement_id == null) {
            return null;
        }
        Logement logement = logement_repository.findById(logement_id)
                .orElseThrow(() -> new RessourceIntrouvable("Logement introuvable : " + logement_id));
        if (utilisateur.bailleur() && !logement.getBailleur().getId().equals(utilisateur.id())) {
            throw new RessourceIntrouvable("Logement introuvable : " + logement_id);
        }
        return logement;
    }

    private void appliquer(Locataire locataire, LocataireRequest request) {
        locataire.setLast_name(request.last_name());
        locataire.setFirst_name(request.first_name());
        locataire.setPhone(request.phone());
        locataire.setBirth_date(request.birth_date());
    }

    // admin: tout ; bailleur: ses locataires ; locataire: lui-meme. 404 sinon / else 404
    private Locataire visible(Long id) {
        Locataire locataire = locataire_repository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvable("Locataire introuvable : " + id));
        boolean autorise = utilisateur.admin()
                || (utilisateur.bailleur() && locataire_repository.lie_au_bailleur(id, utilisateur.id()))
                || (utilisateur.locataire() && id.equals(utilisateur.id()));
        if (!autorise) {
            throw new RessourceIntrouvable("Locataire introuvable : " + id);
        }
        return locataire;
    }
}
