package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "L'e-mail est obligatoire")
        @Email(regexp = Regles.email, message = "Format d'e-mail invalide") String email,
        @NotBlank(message = "Le mot de passe est obligatoire") String password) {
}
