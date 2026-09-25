package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.NotNull;

public record AbonnementRequest(
        @NotNull(message = "Le bailleur est obligatoire") Long bailleur_id,
        @NotNull(message = "Le plan est obligatoire") Long plan_id) {
}
