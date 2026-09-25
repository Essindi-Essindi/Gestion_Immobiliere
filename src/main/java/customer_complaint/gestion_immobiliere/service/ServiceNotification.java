package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.NotificationResponse;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Notification;
import customer_complaint.gestion_immobiliere.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// creer() est appele par les autres services (meme transaction) ; le reste ne voit que MES notifications
// creer() is called by the other services (same transaction); everything else only sees MY notifications
@Service
@Transactional
@RequiredArgsConstructor
public class ServiceNotification {

    private final NotificationRepository notification_repository;
    private final UtilisateurCourant utilisateur;

    public void creer(String role, Long id, String type, String title, String message, String ref_type, Long ref_id) {
        Notification notification = new Notification();
        notification.setRecipient_role(role);
        notification.setRecipient_id(id);
        notification.setType(type);
        notification.setTitle(tronquer(title, 150));
        notification.setMessage(tronquer(message, 1000));
        notification.setRef_type(ref_type);
        notification.setRef_id(ref_id);
        notification_repository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(boolean non_lues_seulement, int limit) {
        PageRequest page = PageRequest.of(0, Math.max(1, Math.min(limit, 200)));
        List<Notification> notifications = non_lues_seulement
                ? notification_repository.find_unread_for(utilisateur.role(), utilisateur.id(), page)
                : notification_repository.find_for(utilisateur.role(), utilisateur.id(), page);
        return notifications.stream().map(NotificationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public long non_lues() {
        return notification_repository.count_unread(utilisateur.role(), utilisateur.id());
    }

    public NotificationResponse marquer_lue(Long id) {
        Notification notification = notification_repository.findById(id)
                .filter(n -> n.getRecipient_role().equals(utilisateur.role()) && n.getRecipient_id().equals(utilisateur.id()))
                .orElseThrow(() -> new RessourceIntrouvable("Notification introuvable : " + id));
        notification.setSeen(true);
        return NotificationResponse.from(notification);
    }

    public int tout_lire() {
        return notification_repository.mark_all_read(utilisateur.role(), utilisateur.id());
    }

    private static String tronquer(String texte, int max) {
        return texte.length() <= max ? texte : texte.substring(0, max - 1) + "…";
    }
}
