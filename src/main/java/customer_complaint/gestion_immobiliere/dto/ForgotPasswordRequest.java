package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "L'e-mail est obligatoire")
        @Email(regexp = Regles.email, message = "Format d'e-mail invalide") String email) {
}
