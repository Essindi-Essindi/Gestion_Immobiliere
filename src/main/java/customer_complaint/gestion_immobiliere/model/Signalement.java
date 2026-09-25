package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "signalement")
@Getter
@Setter
public class Signalement extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private String category;

    // edge case: photo en base64, bien plus longue que 255 caracteres / base64 photo, far above 255 chars
    @Column(columnDefinition = "LONGTEXT")
    private String photo;

    @Column(length = 150)
    private String title;

    // message du bailleur au locataire / landlord message to the tenant
    @Column(length = 1000)
    private String response;

    // BASSE, NORMALE, HAUTE, URGENTE
    @Column(nullable = false, length = 10)
    private String priority = "NORMALE";

    // NOUVEAU -> EN_COURS -> TERMINE
    @Column(nullable = false)
    private String status = Statuts.nouveau;

    @Column(nullable = false)
    private LocalDate creation_date;

    @ManyToOne(optional = false)
    @JoinColumn(name = "locataire_id", nullable = false)
    private Locataire locataire;

    // le signalement porte sur le logement du locataire / issue is about the tenant's home
    @ManyToOne(optional = false)
    @JoinColumn(name = "logement_id", nullable = false)
    private Logement logement;

    @PrePersist
    void default_creation_date() {
        if (creation_date == null) {
            creation_date = LocalDate.now();
        }
    }

    public void process() {
    }

    public void close() {
    }
}
