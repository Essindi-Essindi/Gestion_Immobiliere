package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ParametresRequest(
        @NotBlank(message = "Le nom de la plateforme est obligatoire") @Size(max = 100) String platform_name,
        @NotBlank(message = "L'e-mail du support est obligatoire")
        @Email(regexp = Regles.email, message = "Format d'e-mail invalide") @Size(max = 150) String support_email,
        @NotBlank @Pattern(regexp = "[A-Z]{3}", message = "La devise doit être un code ISO sur 3 lettres (ex: EUR)") String currency,
        @NotBlank(message = "Le fuseau horaire est obligatoire") @Size(max = 50) String timezone,
        @NotNull Boolean maintenance_mode,
        @NotNull Boolean email_notifications,
        @NotNull Boolean open_registration,
        @NotNull @Min(value = 1, message = "Minimum 1") @Max(10000) Integer max_logements_basic,
        @NotNull @Min(value = 1, message = "Minimum 1") @Max(10000) Integer max_logements_premium,
        @NotNull @Min(value = 1, message = "Minimum 1 Mo") @Max(200) Integer max_upload_size_mb,
        @NotNull @Min(value = 5, message = "Minimum 5 minutes") @Max(1440) Integer session_duration_minutes) {
}
