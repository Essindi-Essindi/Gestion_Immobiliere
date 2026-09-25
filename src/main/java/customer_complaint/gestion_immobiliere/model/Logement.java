package customer_complaint.gestion_immobiliere.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "logement")
@Getter
@Setter
public class Logement extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String address;

    private String postal_code;
    private String city;

    @Column(nullable = false)
    private String country = "France";

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private double area;

    @Column(nullable = false)
    private double rent;

    // charges mensuelles / monthly charges
    @Column(nullable = false)
    private double charges;

    // valeur de reference ; l'API renvoie le statut calcule a partir des contrats (LOUE / VACANT)
    @Column(nullable = false)
    private String status = Statuts.vacant;

    @ManyToOne(optional = false)
    @JoinColumn(name = "bailleur_id", nullable = false)
    private Bailleur bailleur;

    @JsonIgnore
    @OneToMany(mappedBy = "logement")
    private List<Contrat> contrats = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "logement")
    private List<Signalement> signalements = new ArrayList<>();

    // pieces du logement (chambres, salon...) / rooms of the home
    @JsonIgnore
    @OneToMany(mappedBy = "logement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Piece> pieces = new ArrayList<>();

    public void update() {
    }

    public void delete() {
    }
}
