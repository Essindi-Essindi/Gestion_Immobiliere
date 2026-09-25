package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminRequest(
        @NotBlank(message = "Le nom est obligatoire") @Size(max = 100) String last_name,
        @NotBlank(message = "Le prénom est obligatoire") @Size(max = 100) String first_name,
        @NotBlank(message = "L'e-mail est obligatoire")
        @Email(regexp = Regles.email, message = "Format d'e-mail invalide") @Size(max = 150) String email,
        // obligatoire a la creation, verifie dans le service / required on create, checked in the service
        @MotDePasseValide String password,
        @NotBlank(message = "Le niveau d'accès est obligatoire") String access_level) {
}
