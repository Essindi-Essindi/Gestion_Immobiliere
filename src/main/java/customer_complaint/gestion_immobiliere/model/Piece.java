package customer_complaint.gestion_immobiliere.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

// piece d'un logement (chambre, salon...) ; capacite 0 = piece commune / room of a home; capacity 0 = shared room
@Entity
@Table(name = "piece", uniqueConstraints = @UniqueConstraint(columnNames = {"logement_id", "numero"}))
@Getter
@Setter
public class Piece {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String numero;

    // CHAMBRE, SALON, CUISINE, SALLE_DE_BAIN, BUREAU, AUTRE
    @Column(nullable = false, length = 20)
    private String type = "CHAMBRE";

    @Column(nullable = false)
    private int capacite = 1;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "logement_id", nullable = false)
    private Logement logement;

    @JsonIgnore
    @OneToMany(mappedBy = "piece")
    private List<Locataire> occupants = new ArrayList<>();
}
