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

// journal d'audit : qui a fait quoi, quand, d'ou. Jamais modifie ni supprime par l'application
// audit log: who did what, when, from where. Never updated or deleted by the application
@Entity
@Table(name = "journal_audit", indexes = {@Index(columnList = "created_at"), @Index(columnList = "type")})
@Getter
@Setter
public class JournalAudit extends Auditable {

    public static final String login = "LOGIN";
    public static final String create = "CREATE";
    public static final String update = "UPDATE";
    public static final String delete = "DELETE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ADMIN, BAILLEUR, LOCATAIRE, ANONYME (connexion echouee) ou SYSTEME
    @Column(nullable = false, length = 10)
    private String actor_role;

    private Long actor_id;

    // nom copie au moment des faits : il reste lisible meme si le compte est supprime ensuite
    // name copied at the time: stays readable even if the account is deleted later
    @Column(nullable = false, length = 150)
    private String actor_name;

    // famille pour les filtres : LOGIN, CREATE, UPDATE, DELETE
    @Column(nullable = false, length = 10)
    private String type;

    // code precis, ex: LOGIN_ECHEC, COMPTE_SUSPENDU, LOGEMENT_CREE
    @Column(nullable = false, length = 40)
    private String action;

    @Column(nullable = false, length = 500)
    private String details;

    @Column(length = 30)
    private String target_type;

    private Long target_id;

    @Column(length = 45)
    private String ip;
}
