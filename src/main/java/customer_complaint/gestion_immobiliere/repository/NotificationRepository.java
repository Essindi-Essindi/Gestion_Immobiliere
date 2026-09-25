package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("select n from Notification n where n.recipient_role = :role and n.recipient_id = :id "
            + "order by n.created_at desc, n.id desc")
    List<Notification> find_for(@Param("role") String role, @Param("id") Long id, Pageable pageable);

    @Query("select n from Notification n where n.recipient_role = :role and n.recipient_id = :id and n.seen = false "
            + "order by n.created_at desc, n.id desc")
    List<Notification> find_unread_for(@Param("role") String role, @Param("id") Long id, Pageable pageable);

    @Query("select count(n) from Notification n where n.recipient_role = :role and n.recipient_id = :id and n.seen = false")
    long count_unread(@Param("role") String role, @Param("id") Long id);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update Notification n set n.seen = true where n.recipient_role = :role and n.recipient_id = :id and n.seen = false")
    int mark_all_read(@Param("role") String role, @Param("id") Long id);
}
