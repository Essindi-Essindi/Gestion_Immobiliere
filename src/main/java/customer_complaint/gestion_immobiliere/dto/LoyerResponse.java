package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Loyer;
import customer_complaint.gestion_immobiliere.model.Statuts;

import java.time.LocalDate;
import java.time.LocalDateTime;

// status : PAYE si paid_date, sinon EN_RETARD apres l'echeance, sinon EN_ATTENTE
public record LoyerResponse(Long id, Long contrat_id, Long logement_id, String logement_address,
                            Long locataire_id, String locataire_name, String piece_numero, String period, double amount,
                            LocalDate due_date, LocalDate paid_date, String status, LocalDateTime reminder_sent_at) {

    public static String statut(Loyer loyer) {
        if (loyer.getPaid_date() != null) {
            return Statuts.paye;
        }
        return loyer.getDue_date().isBefore(LocalDate.now()) ? Statuts.en_retard : Statuts.en_attente;
    }

    public static LoyerResponse from(Loyer loyer) {
        return new LoyerResponse(loyer.getId(), loyer.getContrat().getId(), loyer.getContrat().getLogement().getId(),
                loyer.getContrat().getLogement().getAddress(), loyer.getContrat().getLocataire().getId(),
                loyer.getContrat().getLocataire().getFirst_name() + " " + loyer.getContrat().getLocataire().getLast_name(),
                loyer.getContrat().getLocataire().getPiece() != null ? loyer.getContrat().getLocataire().getPiece().getNumero() : null,
                loyer.getPeriod(), loyer.getAmount(), loyer.getDue_date(), loyer.getPaid_date(), statut(loyer),
                loyer.getReminder_sent_at());
    }
}
