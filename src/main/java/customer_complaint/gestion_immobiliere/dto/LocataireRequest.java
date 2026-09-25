package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

// password : absent = invitation par lien, present = mot de passe temporaire / absent = invitation link, present = temporary password
// piece_id : chambre occupee (doit appartenir au logement) / occupied room (must belong to the home)
// logement_id : logement auquel rattacher le locataire (absent a la mise a jour = inchange) / home to attach the tenant to (absent on update = unchanged)
public record LocataireRequest(
        @NotBlank(message = "Le nom est obligatoire") @Size(max = 100) String last_name,
        @NotBlank(message = "Le prénom est obligatoire") @Size(max = 100) String first_name,
        @NotBlank(message = "L'e-mail est obligatoire")
        @Email(regexp = Regles.email, message = "Format d'e-mail invalide") @Size(max = 150) String email,
        @MotDePasseValide String password,
        @Pattern(regexp = Regles.phone, message = "Numéro de téléphone invalide") String phone,
        @Past(message = "La date de naissance doit être dans le passé") LocalDate birth_date,
        Long logement_id,
        Long piece_id) {
}
