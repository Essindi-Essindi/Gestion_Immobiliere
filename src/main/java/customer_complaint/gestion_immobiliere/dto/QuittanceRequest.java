package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record QuittanceRequest(
        @NotBlank(message = "La période est obligatoire")
        @Pattern(regexp = Regles.period, message = "La période doit avoir le format AAAA-MM") String period,
        @NotNull(message = "Le montant est obligatoire") @Positive(message = "Le montant doit être positif") Double amount,
        @PastOrPresent(message = "La date d'émission ne peut pas être dans le futur") LocalDate issue_date,
        @NotNull(message = "Le contrat est obligatoire") Long contrat_id) {
}
