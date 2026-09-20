package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "contrat")
public class Contrat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate start_date;
    private LocalDate end_date;
    private double monthly_rent;

    @ManyToOne
    @JoinColumn(name = "logement_id")
    private Logement logement;

    @ManyToOne
    @JoinColumn(name = "bailleur_id")
    private Bailleur bailleur;

    @ManyToOne
    @JoinColumn(name = "locataire_id")
    private Locataire locataire;

    @OneToMany(mappedBy = "contrat")
    private List<Quittance> quittances;

    public void generate_pdf() {
    }

    public void terminate() {
    }
}
