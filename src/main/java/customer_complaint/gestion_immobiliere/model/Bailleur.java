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
@Table(name = "bailleur")
public class Bailleur implements Compte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String last_name;
    private String first_name;
    private String email;
    private String password;
    private String phone;
    private String address;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @OneToMany(mappedBy = "bailleur")
    private List<Logement> logements;

    @OneToMany(mappedBy = "bailleur")
    private List<Contrat> contrats;

    @Override
    public void log_in() {
    }

    @Override
    public void log_out() {
    }

    public void manage_properties() {
    }

    public void generate_receipt() {
    }
}
