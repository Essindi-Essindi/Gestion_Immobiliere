package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Quittance;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record QuittanceResponse(Long id, String period, double amount, LocalDate issue_date, Long contrat_id,
                                LocalDateTime created_at, LocalDateTime updated_at) {

    public static QuittanceResponse from(Quittance quittance) {
        return new QuittanceResponse(quittance.getId(), quittance.getPeriod(), quittance.getAmount(),
                quittance.getIssue_date(), quittance.getContrat().getId(), quittance.getCreated_at(),
                quittance.getUpdated_at());
    }
}
