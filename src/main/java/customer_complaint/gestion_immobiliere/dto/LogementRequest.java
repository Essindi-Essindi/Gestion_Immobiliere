package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;

// le bailleur vient du jeton et le statut (LOUE/VACANT) est calcule : ni l'un ni l'autre ne sont acceptes ici
// the landlord comes from the token and the status (LOUE/VACANT) is computed: neither is accepted here
// pieces : absent = inchange a la mise a jour / absent = unchanged on update
public record LogementRequest(
        @NotBlank(message = "L'adresse est obligatoire") @Size(max = 255) String address,
        @Size(max = 10, message = "Code postal trop long (10 caractères max)") String postal_code,
        @NotBlank(message = "La ville est obligatoire") @Size(max = 100) String city,
        @Size(max = 60) String country,
        @NotBlank(message = "Le type est obligatoire") @Size(max = 50) String type,
        @NotNull(message = "La surface est obligatoire") @Positive(message = "La surface doit être positive") Double area,
        @NotNull(message = "Le loyer est obligatoire") @Positive(message = "Le loyer doit être positif") Double rent,
        @PositiveOrZero(message = "Les charges ne peuvent pas être négatives") Double charges,
        @Size(max = 50, message = "50 pièces maximum") List<@Valid PieceRequest> pieces) {
}
