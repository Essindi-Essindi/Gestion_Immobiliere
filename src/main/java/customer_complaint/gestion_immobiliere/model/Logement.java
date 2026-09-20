package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.List;

@Entity
@Table(name = "logement")
public class Logement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String address;
    private String type;
    private double area;
    private double rent;
    private String status;

    @ManyToOne
    @JoinColumn(name = "bailleur_id")
    private Bailleur bailleur;

    @OneToMany(mappedBy = "logement")
    private List<Contrat> contrats;

    public void update() {
    }

    public void delete() {
    }
}
