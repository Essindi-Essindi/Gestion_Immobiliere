package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Abonnement;
import customer_complaint.gestion_immobiliere.model.Bailleur;
import customer_complaint.gestion_immobiliere.model.Statuts;

import java.time.LocalDateTime;
import java.util.List;

// status : ACTIF ou SUSPENDU ; plan : plan de l'abonnement en cours (ou null)
public record AdminBailleurResponse(Long id, String name, String last_name, String first_name, String email,
                                    String phone, String address, String status, String suspension_reason,
                                    String plan, String subscription_status, int logements, int locataires,
                                    LocalDateTime registered_at, List<LogementResponse> properties) {

    public static AdminBailleurResponse from(Bailleur bailleur, Abonnement abonnement, int logements, int locataires,
                                             List<LogementResponse> properties) {
        return new AdminBailleurResponse(bailleur.getId(),
                bailleur.getFirst_name() + " " + bailleur.getLast_name(), bailleur.getLast_name(),
                bailleur.getFirst_name(), bailleur.getEmail(), bailleur.getPhone(), bailleur.getAddress(),
                bailleur.isActive() ? Statuts.actif : Statuts.suspendu, bailleur.getSuspension_reason(),
                abonnement != null ? abonnement.getPlan().getName() : null,
                abonnement != null ? abonnement.getStatus() : null, logements, locataires,
                bailleur.getCreated_at(), properties);
    }
}
