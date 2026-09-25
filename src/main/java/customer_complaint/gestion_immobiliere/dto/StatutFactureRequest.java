package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record StatutFactureRequest(
        @NotBlank(message = "Le statut est obligatoire")
        @Pattern(regexp = "PAYEE|EN_ATTENTE|ECHEC", message = "Le statut doit valoir PAYEE, EN_ATTENTE ou ECHEC") String status) {
}
