package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Loyer;

import java.time.LocalDate;
import java.time.LocalDateTime;

// vue "locataire" d'un loyer : sans rien qui concerne la gestion interne du bailleur
// tenant's view of a rent: nothing about the landlord's internal handling
public record PaiementResponse(Long id, String period, int year, int month, double amount, LocalDate due_date,
                               LocalDate paid_date, String status, boolean reminder_received,
                               LocalDateTime reminder_sent_at, Long quittance_id, String logement_address) {

    public static PaiementResponse from(Loyer loyer, Long quittance_id) {
        String[] parties = loyer.getPeriod().split("-");
        return new PaiementResponse(loyer.getId(), loyer.getPeriod(), Integer.parseInt(parties[0]),
                Integer.parseInt(parties[1]), loyer.getAmount(), loyer.getDue_date(), loyer.getPaid_date(),
                LoyerResponse.statut(loyer), loyer.getReminder_sent_at() != null, loyer.getReminder_sent_at(),
                quittance_id, loyer.getContrat().getLogement().getAddress());
    }
}
