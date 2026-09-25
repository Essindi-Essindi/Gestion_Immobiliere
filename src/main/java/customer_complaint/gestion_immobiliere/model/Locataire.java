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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "locataire")
@Getter
@Setter
public class Locataire extends Auditable implements Compte {

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
    private LocalDate birth_date;

    // vrai tant que le locataire n a pas choisi son propre mot de passe / true until the tenant picks their own password
    @Column(nullable = false)
    private boolean must_change_password;

    // compte suspendu par un admin : plus de connexion possible / suspended by an admin: no more login
    @ColumnDefault("true")
    @Column(nullable = false)
    private boolean active = true;

    private LocalDateTime suspended_at;

    @Column(length = 300)
    private String suspension_reason;

    // bailleur qui a cree le compte, base du controle d acces / landlord who created the account, basis of access control
    @ManyToOne
    @JoinColumn(name = "bailleur_id")
    private Bailleur bailleur;

    // logement auquel le locataire est rattache (requis avant un contrat) / home the tenant is attached to (required before a contract)
    @ManyToOne
    @JoinColumn(name = "logement_id")
    private Logement logement;

    // chambre occupee dans le logement / room occupied in the home
    @ManyToOne
    @JoinColumn(name = "piece_id")
    private Piece piece;

    // nullable: cree par l admin / created by the admin
    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @JsonIgnore
    @OneToMany(mappedBy = "locataire")
    private List<Contrat> contrats = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "locataire")
    private List<Signalement> signalements = new ArrayList<>();

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
