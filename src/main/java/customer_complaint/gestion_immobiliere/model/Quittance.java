package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "quittance", uniqueConstraints = @UniqueConstraint(columnNames = {"contrat_id", "period"}))
@Getter
@Setter
public class Quittance extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ex: 2026-09 ; une seule quittance par contrat et par periode
    @NotBlank
    @Column(nullable = false)
    private String period;

    @Column(nullable = false)
    private double amount;

    @Column(nullable = false)
    private LocalDate issue_date;

    @ManyToOne(optional = false)
    @JoinColumn(name = "contrat_id", nullable = false)
    private Contrat contrat;

    @PrePersist
    void default_issue_date() {
        if (issue_date == null) {
            issue_date = LocalDate.now();
        }
    }

    public void generate_pdf() {
    }

    public void send() {
    }
}
