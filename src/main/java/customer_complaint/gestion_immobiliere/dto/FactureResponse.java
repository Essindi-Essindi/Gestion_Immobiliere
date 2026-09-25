package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Facture;

import java.time.LocalDate;

// facture SIMULEE ; status : PAYEE, EN_ATTENTE ou ECHEC
public record FactureResponse(Long id, String reference, Long abonnement_id, Long bailleur_id, String bailleur_name,
                              String plan_name, String period, double amount, String status, LocalDate issued_on,
                              LocalDate paid_on) {

    public static FactureResponse from(Facture facture) {
        return new FactureResponse(facture.getId(), facture.getReference(), facture.getAbonnement().getId(),
                facture.getBailleur().getId(),
                facture.getBailleur().getFirst_name() + " " + facture.getBailleur().getLast_name(),
                facture.getPlan_name(), facture.getPeriod(), facture.getAmount(), facture.getStatus(),
                facture.getIssued_on(), facture.getPaid_on());
    }
}
