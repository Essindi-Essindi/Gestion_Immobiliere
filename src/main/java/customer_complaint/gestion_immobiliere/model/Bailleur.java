package customer_complaint.gestion_immobiliere.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import org.hibernate.annotations.ColumnDefault;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bailleur")
@Getter
@Setter
public class Bailleur extends Auditable implements Compte {

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

    private String phone;
    private String address;

    // compte suspendu par un admin : plus de connexion possible / suspended by an admin: no more login
    @ColumnDefault("true")
    @Column(nullable = false)
    private boolean active = true;

    private LocalDateTime suspended_at;

    @Column(length = 300)
    private String suspension_reason;

    // nullable: inscription libre possible / self-registration allowed
    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @JsonIgnore
    @OneToMany(mappedBy = "bailleur")
    private List<Logement> logements = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "bailleur")
    private List<Contrat> contrats = new ArrayList<>();

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
