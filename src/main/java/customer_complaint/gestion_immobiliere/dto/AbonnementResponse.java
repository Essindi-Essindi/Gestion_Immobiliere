package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Abonnement;

import java.time.LocalDate;

// status : ACTIF, SUSPENDU ou RESILIE
public record AbonnementResponse(Long id, Long bailleur_id, String bailleur_name, String bailleur_email, Long plan_id,
                                 String plan_name, double price, int period_months, String status,
                                 LocalDate start_date, LocalDate next_billing_date, LocalDate ended_on) {

    public static AbonnementResponse from(Abonnement abonnement) {
        return new AbonnementResponse(abonnement.getId(), abonnement.getBailleur().getId(),
                abonnement.getBailleur().getFirst_name() + " " + abonnement.getBailleur().getLast_name(),
                abonnement.getBailleur().getEmail(), abonnement.getPlan().getId(), abonnement.getPlan().getName(),
                abonnement.getPlan().getPrice(), abonnement.getPlan().getPeriod_months(), abonnement.getStatus(),
                abonnement.getStart_date(), abonnement.getNext_billing_date(), abonnement.getEnded_on());
    }
}
