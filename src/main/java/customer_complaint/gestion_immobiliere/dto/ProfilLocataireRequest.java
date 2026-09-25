package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

// ni e-mail (identifiant de connexion), ni mot de passe, ni logement : ils ont leurs propres circuits
// no email (login id), no password, no home: they have their own flows
public record ProfilLocataireRequest(
        @NotBlank(message = "Le nom est obligatoire") @Size(max = 100) String last_name,
        @NotBlank(message = "Le prénom est obligatoire") @Size(max = 100) String first_name,
        @Pattern(regexp = Regles.phone, message = "Numéro de téléphone invalide") String phone,
        @Past(message = "La date de naissance doit être dans le passé") LocalDate birth_date) {
}
