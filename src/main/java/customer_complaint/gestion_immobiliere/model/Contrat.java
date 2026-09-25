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
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contrat")
@Getter
@Setter
public class Contrat extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private LocalDate start_date;

    private LocalDate end_date;

    @Column(nullable = false)
    private double monthly_rent;

    // depot de garantie, cite dans le cas "gerer les contrats" / security deposit
    private double deposit;

    @ManyToOne(optional = false)
    @JoinColumn(name = "logement_id", nullable = false)
    private Logement logement;

    @ManyToOne(optional = false)
    @JoinColumn(name = "bailleur_id", nullable = false)
    private Bailleur bailleur;

    @ManyToOne(optional = false)
    @JoinColumn(name = "locataire_id", nullable = false)
    private Locataire locataire;

    // le locataire a demande a partir : condition necessaire pour que le bailleur resilie / tenant asked to leave: required before the landlord can terminate
    @Column(nullable = false)
    private boolean resiliation_demandee = false;

    @JsonIgnore
    @OneToMany(mappedBy = "contrat")
    private List<Quittance> quittances = new ArrayList<>();

    public void generate_pdf() {
    }

    public void terminate() {
    }
}
