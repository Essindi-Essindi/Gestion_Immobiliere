package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

// PAYE = encaisse (paid_date, aujourd'hui par defaut) ; EN_ATTENTE ou EN_RETARD = annule le paiement (le retard se deduit de la date)
public record StatutLoyerRequest(
        @NotBlank(message = "Le statut est obligatoire")
        @Pattern(regexp = "PAYE|EN_ATTENTE|EN_RETARD", message = "Le statut doit valoir PAYE, EN_ATTENTE ou EN_RETARD") String status,
        @PastOrPresent(message = "La date de paiement ne peut pas être dans le futur") LocalDate paid_date) {
}
