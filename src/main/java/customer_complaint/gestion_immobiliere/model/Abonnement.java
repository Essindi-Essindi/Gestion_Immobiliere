package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

// abonnement d'un bailleur a un plan ; un bailleur n'a qu'un abonnement non resilie a la fois
// a landlord's subscription to a plan; only one non-terminated subscription at a time
@Entity
@Table(name = "abonnement")
@Getter
@Setter
public class Abonnement extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "bailleur_id", nullable = false)
    private Bailleur bailleur;

    @ManyToOne(optional = false)
    @JoinColumn(name = "plan_id", nullable = false)
    private PlanAbonnement plan;

    // ACTIF, SUSPENDU ou RESILIE
    @Column(nullable = false, length = 10)
    private String status = Statuts.actif;

    @Column(nullable = false)
    private LocalDate start_date;

    // prochaine echeance de facturation / next billing date
    @Column(nullable = false)
    private LocalDate next_billing_date;

    private LocalDate ended_on;
}
