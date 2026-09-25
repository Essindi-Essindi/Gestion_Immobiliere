package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

// suivi par e-mail (meme pour un e-mail inconnu, pour ne pas reveler quels comptes existent)
// tracked per email (even unknown ones, so lockout does not reveal which accounts exist)
@Entity
@Table(name = "tentative_connexion")
@Getter
@Setter
public class TentativeConnexion extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private int failed_count;

    private Instant locked_until;
}
