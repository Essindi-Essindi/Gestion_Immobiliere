package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// notification interne, pour n'importe quel role ; le destinataire est (recipient_role, recipient_id)
// in-app notification for any role; the recipient is (recipient_role, recipient_id)
@Entity
@Table(name = "notification", indexes = @Index(columnList = "recipient_role, recipient_id"))
@Getter
@Setter
public class Notification extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String recipient_role;

    @Column(nullable = false)
    private Long recipient_id;

    // INFO, SUCCESS, WARNING, ALERT
    @Column(nullable = false, length = 10)
    private String type;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private boolean seen;

    // objet concerne, pour que le front puisse ouvrir la bonne page (SIGNALEMENT, LOYER, CONTRAT, QUITTANCE)
    @Column(length = 30)
    private String ref_type;

    private Long ref_id;
}
