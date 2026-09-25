package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import customer_complaint.gestion_immobiliere.dto.NotificationResponse;
import customer_complaint.gestion_immobiliere.service.ServiceNotification;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

// les notifications de l'utilisateur connecte, quel que soit son role / the logged-in user's notifications, any role
@RestController
@RequestMapping("/api/notifications")
@PreAuthorize(Acces.tous)
public class ControleurNotification {

    private final ServiceNotification service_notification;

    public ControleurNotification(ServiceNotification service_notification) {
        this.service_notification = service_notification;
    }

    @GetMapping
    public List<NotificationResponse> list(@RequestParam(defaultValue = "false") boolean unread,
                                           @RequestParam(defaultValue = "50") int limit) {
        return service_notification.list(unread, limit);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> non_lues() {
        return Map.of("count", service_notification.non_lues());
    }

    @PostMapping("/{id}/read")
    public NotificationResponse marquer_lue(@PathVariable Long id) {
        return service_notification.marquer_lue(id);
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void tout_lire() {
        service_notification.tout_lire();
    }
}
