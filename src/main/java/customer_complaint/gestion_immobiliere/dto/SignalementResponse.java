package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Signalement;

import java.time.LocalDate;
import java.time.LocalDateTime;

// status : NOUVEAU, EN_COURS ou TERMINE ; priority : BASSE, NORMALE, HAUTE ou URGENTE ; response : message du bailleur
public record SignalementResponse(Long id, String title, String description, String category, String priority,
                                  String photo, String status, String response, LocalDate creation_date,
                                  Long locataire_id, String locataire_name, Long logement_id, String logement_address,
                                  LocalDateTime created_at, LocalDateTime updated_at) {

    public static SignalementResponse from(Signalement signalement) {
        return new SignalementResponse(signalement.getId(), signalement.getTitle(), signalement.getDescription(),
                signalement.getCategory(), signalement.getPriority(), signalement.getPhoto(), signalement.getStatus(),
                signalement.getResponse(), signalement.getCreation_date(), signalement.getLocataire().getId(),
                signalement.getLocataire().getFirst_name() + " " + signalement.getLocataire().getLast_name(),
                signalement.getLogement().getId(), signalement.getLogement().getAddress(),
                signalement.getCreated_at(), signalement.getUpdated_at());
    }
}
