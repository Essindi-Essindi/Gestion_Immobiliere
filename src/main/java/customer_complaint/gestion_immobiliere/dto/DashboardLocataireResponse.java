package customer_complaint.gestion_immobiliere.dto;

import java.time.LocalDate;
import java.util.List;

public record DashboardLocataireResponse(String logement_type, String logement_address, Double loyer,
                                         LocalDate dernier_paiement, String prochaine_echeance,
                                         LocalDate prochaine_echeance_date, ContratResume contrat,
                                         int signalements_ouverts, long notifications_non_lues,
                                         List<NotificationResponse> dernieres_notifications) {

    public record ContratResume(Long id, String logement_address, double loyer, LocalDate start_date,
                                LocalDate end_date) {
    }
}
