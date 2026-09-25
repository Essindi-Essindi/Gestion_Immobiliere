package customer_complaint.gestion_immobiliere.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "admin")
@Getter
@Setter
public class Admin extends Auditable implements Compte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String last_name;

    @NotBlank
    @Column(nullable = false)
    private String first_name;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String access_level;

    @JsonIgnore
    @OneToMany(mappedBy = "admin")
    private List<Bailleur> bailleurs = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "admin")
    private List<Locataire> locataires = new ArrayList<>();

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
