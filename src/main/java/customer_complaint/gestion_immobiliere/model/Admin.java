package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.List;

@Entity
@Table(name = "admin")
public class Admin implements Compte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String last_name;
    private String first_name;
    private String email;
    private String password;
    private String access_level;

    @OneToMany(mappedBy = "admin")
    private List<Bailleur> bailleurs;

    @OneToMany(mappedBy = "admin")
    private List<Locataire> locataires;

    @Override
    public void log_in() {
    }

    @Override
    public void log_out() {
    }

    public void manage_accounts() {
    }

    public void view_activity() {
    }

    public void manage_roles() {
    }
}
