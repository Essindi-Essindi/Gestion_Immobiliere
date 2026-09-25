package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// capacite 0 = piece commune (salon, cuisine...) / capacity 0 = shared room
public record PieceRequest(
        @NotBlank(message = "Le numéro de pièce est obligatoire") @Size(max = 20, message = "Numéro de pièce trop long (20 max)") String numero,
        @NotBlank(message = "Le type de pièce est obligatoire")
        @Pattern(regexp = "CHAMBRE|SALON|CUISINE|SALLE_DE_BAIN|BUREAU|AUTRE", message = "Type de pièce invalide") String type,
        @Min(value = 0, message = "La capacité ne peut pas être négative") @Max(value = 20, message = "Capacité maximale : 20") Integer capacite) {
}
