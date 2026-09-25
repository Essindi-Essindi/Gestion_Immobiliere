package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plan_abonnement")
@Getter
@Setter
public class PlanAbonnement extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String name;

    // prix par periode de facturation / price per billing period
    @Column(nullable = false)
    private double price;

    // 1 = mensuel, 12 = annuel / 1 = monthly, 12 = yearly
    @Column(nullable = false)
    private int period_months = 1;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plan_abonnement_feature", joinColumns = @JoinColumn(name = "plan_id"))
    @OrderColumn(name = "position")
    @Column(name = "feature", length = 200)
    private List<String> features = new ArrayList<>();

    // null = illimite ; applique a la creation d'un logement / null = unlimited; enforced when creating a home
    private Integer max_logements;

    // mis en avant sur la page des offres / highlighted on the pricing page
    private boolean highlighted;

    // plan suspendu : plus de nouvelle souscription, les abonnes existants continuent
    // suspended plan: no new subscriptions, existing subscribers keep it
    @Column(nullable = false)
    private boolean suspended;
}
