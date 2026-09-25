package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BailleurRequest(
        @NotBlank(message = "Le nom est obligatoire") @Size(max = 100) String last_name,
        @NotBlank(message = "Le prénom est obligatoire") @Size(max = 100) String first_name,
        @NotBlank(message = "L'e-mail est obligatoire")
        @Email(regexp = Regles.email, message = "Format d'e-mail invalide") @Size(max = 150) String email,
        @MotDePasseValide String password,
        @Pattern(regexp = Regles.phone, message = "Numéro de téléphone invalide") String phone,
        @Size(max = 255) String address) {
}
