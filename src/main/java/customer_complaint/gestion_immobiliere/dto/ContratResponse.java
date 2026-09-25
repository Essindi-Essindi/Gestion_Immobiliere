package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Contrat;

import java.time.LocalDate;
import java.time.LocalDateTime;

// actif : commence et pas encore termine aujourd'hui / active: started and not ended today
public record ContratResponse(Long id, LocalDate start_date, LocalDate end_date, double monthly_rent, double deposit,
                              boolean actif, boolean resiliation_demandee, Long logement_id, String logement_address,
                              Long bailleur_id, Long locataire_id, String locataire_name,
                              LocalDateTime created_at, LocalDateTime updated_at) {

    public static boolean est_actif(Contrat contrat) {
        LocalDate today = LocalDate.now();
        return !contrat.getStart_date().isAfter(today)
                && (contrat.getEnd_date() == null || !contrat.getEnd_date().isBefore(today));
    }

    public static ContratResponse from(Contrat contrat) {
        return new ContratResponse(contrat.getId(), contrat.getStart_date(), contrat.getEnd_date(),
                contrat.getMonthly_rent(), contrat.getDeposit(), est_actif(contrat), contrat.isResiliation_demandee(),
                contrat.getLogement().getId(), contrat.getLogement().getAddress(),
                contrat.getBailleur().getId(), contrat.getLocataire().getId(),
                contrat.getLocataire().getFirst_name() + " " + contrat.getLocataire().getLast_name(),
                contrat.getCreated_at(), contrat.getUpdated_at());
    }
}
