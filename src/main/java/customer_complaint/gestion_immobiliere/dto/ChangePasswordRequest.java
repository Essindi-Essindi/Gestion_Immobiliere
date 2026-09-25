package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(
        @NotBlank(message = "Le mot de passe actuel est obligatoire") String current_password,
        @NotBlank(message = "Le nouveau mot de passe est obligatoire") @MotDePasseValide String new_password) {
}
