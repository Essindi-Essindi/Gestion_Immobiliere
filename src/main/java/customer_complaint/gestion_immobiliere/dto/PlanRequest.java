package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;

// max_logements absent = illimite ; period_months : 1 = mensuel, 12 = annuel
public record PlanRequest(
        @NotBlank(message = "Le nom du plan est obligatoire") @Size(max = 60) String name,
        @NotNull(message = "Le prix est obligatoire")
        @PositiveOrZero(message = "Le prix ne peut pas être négatif") Double price,
        @NotNull(message = "La période de facturation est obligatoire")
        @Positive(message = "La période doit être d'au moins 1 mois") @Max(value = 24, message = "24 mois maximum") Integer period_months,
        @Size(max = 20, message = "20 fonctionnalités maximum") List<@NotBlank @Size(max = 200) String> features,
        @Positive(message = "La limite de logements doit être positive") Integer max_logements,
        Boolean highlighted) {
}
