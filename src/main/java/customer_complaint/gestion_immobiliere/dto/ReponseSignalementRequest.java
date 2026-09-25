package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.Size;

// message du bailleur montre au locataire (facultatif) / landlord's message shown to the tenant (optional)
public record ReponseSignalementRequest(
        @Size(max = 1000, message = "La réponse est limitée à 1000 caractères") String response) {
}
