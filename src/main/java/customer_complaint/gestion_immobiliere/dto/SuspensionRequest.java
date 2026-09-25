package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.Size;

// motif facultatif, conserve avec le compte et dans le journal / optional reason, kept with the account and in the audit log
public record SuspensionRequest(@Size(max = 300, message = "Le motif est limité à 300 caractères") String reason) {
}
