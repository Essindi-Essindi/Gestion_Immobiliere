package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.NotNull;

public record ChangementPlanRequest(@NotNull(message = "Le plan est obligatoire") Long plan_id) {
}
