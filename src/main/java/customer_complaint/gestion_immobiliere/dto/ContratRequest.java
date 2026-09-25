package customer_complaint.gestion_immobiliere.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

// le bailleur vient du jeton ; monthly_rent absent = loyer du logement / landlord from the token; no rent = the home's rent
public record ContratRequest(
        @NotNull(message = "La date de début est obligatoire") LocalDate start_date,
        LocalDate end_date,
        @Positive(message = "Le loyer mensuel doit être positif") Double monthly_rent,
        @PositiveOrZero(message = "Le dépôt de garantie ne peut pas être négatif") Double deposit,
        @NotNull(message = "Le logement est obligatoire") Long logement_id,
        @NotNull(message = "Le locataire est obligatoire") Long locataire_id) {

    // edge case: fin avant debut / end before start
    @JsonIgnore
    @AssertTrue(message = "La date de fin doit être postérieure à la date de début")
    public boolean isperiod_valid() {
        return end_date == null || start_date == null || end_date.isAfter(start_date);
    }
}
