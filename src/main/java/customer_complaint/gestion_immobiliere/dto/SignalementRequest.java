package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// le locataire vient de l'URL, pas du corps / tenant comes from the URL, not the body
public record SignalementRequest(
        @Size(max = 150) String title,
        @NotBlank(message = "La description est obligatoire")
        @Size(max = 2000, message = "La description est limitée à 2000 caractères") String description,
        @NotBlank(message = "La catégorie est obligatoire") @Size(max = 100) String category,
        @Pattern(regexp = "BASSE|NORMALE|HAUTE|URGENTE",
                message = "La priorité doit valoir BASSE, NORMALE, HAUTE ou URGENTE") String priority,
        @Size(max = 255) String photo,
        @NotNull(message = "Le logement est obligatoire") Long logement_id) {
}
