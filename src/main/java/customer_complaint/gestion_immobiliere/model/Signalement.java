package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "signalement")
public class Signalement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private String category;
    private String photo;
    private String status;
    private LocalDate creation_date;

    @ManyToOne
    @JoinColumn(name = "locataire_id")
    private Locataire locataire;

    public void process() {
    }

    public void close() {
    }
}
