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
@Table(name = "locataire")
public class Locataire implements Compte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String last_name;
    private String first_name;
    private String email;
    private String password;
    private String phone;
    private LocalDate birth_date;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @OneToMany(mappedBy = "locataire")
    private List<Contrat> contrats;

    @OneToMany(mappedBy = "locataire")
    private List<Signalement> signalements;

    @Override
    public void log_in() {
    }

    @Override
    public void log_out() {
    }

    public void report_issue() {
    }

    public void view_contract() {
    }
}
