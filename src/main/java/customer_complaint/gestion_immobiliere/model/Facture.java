package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

// facture SIMULEE : aucun vrai paiement n'est effectue / SIMULATED invoice: no real payment is made
@Entity
@Table(name = "facture", uniqueConstraints = @UniqueConstraint(columnNames = {"abonnement_id", "period"}))
@Getter
@Setter
public class Facture extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 20)
    private String reference;

    @ManyToOne(optional = false)
    @JoinColumn(name = "abonnement_id", nullable = false)
    private Abonnement abonnement;

    @ManyToOne(optional = false)
    @JoinColumn(name = "bailleur_id", nullable = false)
    private Bailleur bailleur;

    // le nom du plan est copie : renommer le plan ne reecrit pas l'historique / plan name is copied so history stays stable
    @Column(nullable = false, length = 60)
    private String plan_name;

    // AAAA-MM
    @Column(nullable = false, length = 7)
    private String period;

    @Column(nullable = false)
    private double amount;

    // PAYEE, EN_ATTENTE ou ECHEC
    @Column(nullable = false, length = 10)
    private String status = Statuts.en_attente;

    @Column(nullable = false)
    private LocalDate issued_on;

    private LocalDate paid_on;
}
