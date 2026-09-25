package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// une seule ligne (id = 1) : les reglages de la plateforme / a single row (id = 1): the platform settings
@Entity
@Table(name = "parametre_plateforme")
@Getter
@Setter
public class ParametrePlateforme extends Auditable {

    public static final long id_unique = 1L;

    @Id
    private Long id = id_unique;

    @Column(nullable = false, length = 100)
    private String platform_name = "Gestion Immobilière";

    @Column(nullable = false, length = 150)
    private String support_email = "support@gestion-immo.com";

    @Column(nullable = false, length = 3)
    private String currency = "EUR";

    @Column(nullable = false, length = 50)
    private String timezone = "Europe/Paris";

    // vrai : seuls les administrateurs peuvent se connecter / true: only admins can log in
    @Column(nullable = false)
    private boolean maintenance_mode;

    // faux : les rappels de loyer ne sont plus envoyes par e-mail / false: rent reminders are no longer emailed
    @Column(nullable = false)
    private boolean email_notifications = true;

    @Column(nullable = false)
    private boolean open_registration = true;

    // valeurs proposees a la creation d'un plan / values suggested when creating a plan
    @Column(nullable = false)
    private int max_logements_basic = 5;

    @Column(nullable = false)
    private int max_logements_premium = 25;

    @Column(nullable = false)
    private int max_upload_size_mb = 10;

    @Column(nullable = false)
    private int session_duration_minutes = 60;
}
