package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.ParametrePlateforme;

import java.time.LocalDateTime;

public record ParametresResponse(String platform_name, String support_email, String currency, String timezone,
                                 boolean maintenance_mode, boolean email_notifications, boolean open_registration,
                                 int max_logements_basic, int max_logements_premium, int max_upload_size_mb,
                                 int session_duration_minutes, LocalDateTime updated_at) {

    public static ParametresResponse from(ParametrePlateforme p) {
        return new ParametresResponse(p.getPlatform_name(), p.getSupport_email(), p.getCurrency(), p.getTimezone(),
                p.isMaintenance_mode(), p.isEmail_notifications(), p.isOpen_registration(), p.getMax_logements_basic(),
                p.getMax_logements_premium(), p.getMax_upload_size_mb(), p.getSession_duration_minutes(),
                p.getUpdated_at());
    }
}
