package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(@NotBlank(message = "Le jeton de rafraîchissement est obligatoire") String refresh_token) {
}
