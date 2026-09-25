package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequest(
        @NotBlank(message = "Le jeton est obligatoire") String token,
        @NotBlank(message = "Le nouveau mot de passe est obligatoire") @MotDePasseValide String new_password) {
}
