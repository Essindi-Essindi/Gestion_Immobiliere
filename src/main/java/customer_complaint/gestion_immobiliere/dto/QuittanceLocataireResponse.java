package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Quittance;

import java.time.LocalDate;

public record QuittanceLocataireResponse(Long id, String period, int year, int month, double amount,
                                         LocalDate issue_date, String logement_address) {

    public static QuittanceLocataireResponse from(Quittance quittance) {
        String[] parties = quittance.getPeriod().split("-");
        return new QuittanceLocataireResponse(quittance.getId(), quittance.getPeriod(), Integer.parseInt(parties[0]),
                Integer.parseInt(parties[1]), quittance.getAmount(), quittance.getIssue_date(),
                quittance.getContrat().getLogement().getAddress());
    }
}
