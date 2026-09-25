package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.NotNull;

public record AssignationRequest(
        @NotNull(message = "Le locataire est obligatoire") Long locataire_id,
        @NotNull(message = "La chambre est obligatoire") Long piece_id) {
}
