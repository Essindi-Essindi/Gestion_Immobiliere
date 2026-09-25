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
import java.time.LocalDateTime;

// une echeance de loyer = un mois d'un contrat ; le statut se deduit (paid_date + date d'echeance)
// one rent due = one month of a contract; status is derived (paid_date + due date)
@Entity
@Table(name = "loyer", uniqueConstraints = @UniqueConstraint(columnNames = {"contrat_id", "period"}))
@Getter
@Setter
public class Loyer extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "contrat_id", nullable = false)
    private Contrat contrat;

    // AAAA-MM
    @Column(nullable = false, length = 7)
    private String period;

    @Column(nullable = false)
    private double amount;

    @Column(nullable = false)
    private LocalDate due_date;

    // renseigne = paye / set = paid
    private LocalDate paid_date;

    private LocalDateTime reminder_sent_at;
}
