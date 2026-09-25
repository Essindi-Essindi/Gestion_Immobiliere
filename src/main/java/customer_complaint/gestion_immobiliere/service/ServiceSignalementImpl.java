package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.SignalementResponse;
import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Signalement;
import customer_complaint.gestion_immobiliere.model.Statuts;
import customer_complaint.gestion_immobiliere.repository.SignalementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceSignalementImpl implements ServiceSignalement {

    private final ServiceAudit service_audit;
    private final SignalementRepository signalement_repository;
    private final UtilisateurCourant utilisateur;
    private final ServiceNotification service_notification;

    @Override
    @Transactional(readOnly = true)
    public List<SignalementResponse> list(String status) {
        if (status != null && !List.of(Statuts.nouveau, Statuts.en_cours, Statuts.termine).contains(status)) {
            throw new RequeteInvalide("Le statut doit valoir NOUVEAU, EN_COURS ou TERMINE");
        }
        List<Signalement> signalements = utilisateur.bailleur()
                ? signalement_repository.find_by_bailleur(utilisateur.id())
                : signalement_repository.findAll();
        return signalements.stream()
                .filter(s -> status == null || status.equals(s.getStatus()))
                .sorted(Comparator.comparing(Signalement::getCreated_at).reversed())
                .map(SignalementResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SignalementResponse get(Long id) {
        Signalement signalement = trouver(id);
        boolean autorise = gere(signalement)
                || (utilisateur.locataire() && signalement.getLocataire().getId().equals(utilisateur.id()));
        if (!autorise) {
            throw new RessourceIntrouvable("Signalement introuvable : " + id);
        }
        return SignalementResponse.from(signalement);
    }

    @Override
    public SignalementResponse process(Long id, String response) {
        Signalement signalement = gerable(id);
        if (!Statuts.nouveau.equals(signalement.getStatus())) {
            throw new ConflitDonnees("Seule une intervention NOUVEAU peut être prise en charge");
        }
        signalement.setStatus(Statuts.en_cours);
        prevenir_locataire(signalement, response, "INFO", "Intervention prise en charge", "est en cours de traitement");
        return SignalementResponse.from(signalement);
    }

    @Override
    public SignalementResponse close(Long id, String response) {
        Signalement signalement = gerable(id);
        if (Statuts.termine.equals(signalement.getStatus())) {
            throw new ConflitDonnees("Cette intervention est déjà terminée");
        }
        signalement.setStatus(Statuts.termine);
        prevenir_locataire(signalement, response, "SUCCESS", "Intervention terminée", "est terminé");
        return SignalementResponse.from(signalement);
    }

    // garde le message du bailleur et previent le locataire / keeps the landlord message and notifies the tenant
    private void prevenir_locataire(Signalement signalement, String response, String type, String titre, String etat) {
        if (response != null && !response.isBlank()) {
            signalement.setResponse(response.trim());
        }
        service_audit.modification("SIGNALEMENT", signalement.getId(), "Intervention → " + signalement.getStatus());
        String objet = signalement.getTitle() != null ? signalement.getTitle() : signalement.getCategory();
        String message = "Votre signalement « " + objet + " » " + etat + ".";
        if (response != null && !response.isBlank()) {
            message += " Message de votre bailleur : " + response.trim();
        }
        service_notification.creer("LOCATAIRE", signalement.getLocataire().getId(), type, titre, message,
                "SIGNALEMENT", signalement.getId());
    }

    // admin ou bailleur du logement concerne / admin or the landlord of the concerned home
    private boolean gere(Signalement signalement) {
        return utilisateur.admin()
                || (utilisateur.bailleur() && signalement.getLogement().getBailleur().getId().equals(utilisateur.id()));
    }

    private Signalement gerable(Long id) {
        Signalement signalement = trouver(id);
        if (!gere(signalement)) {
            throw new RessourceIntrouvable("Signalement introuvable : " + id);
        }
        return signalement;
    }

    private Signalement trouver(Long id) {
        return signalement_repository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvable("Signalement introuvable : " + id));
    }
}
