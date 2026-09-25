package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Notification;

import java.time.LocalDateTime;

// type : INFO, SUCCESS, WARNING ou ALERT ; ref_type/ref_id : objet concerne (SIGNALEMENT, LOYER, CONTRAT, QUITTANCE)
public record NotificationResponse(Long id, String type, String title, String message, boolean is_read,
                                   String ref_type, Long ref_id, LocalDateTime created_at) {

    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(notification.getId(), notification.getType(), notification.getTitle(),
                notification.getMessage(), notification.isSeen(), notification.getRef_type(), notification.getRef_id(),
                notification.getCreated_at());
    }
}
