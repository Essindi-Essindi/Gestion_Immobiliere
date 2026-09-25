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

// une ligne = une session ; on ne stocke que le hash du jeton / one row = one session; only the token hash is stored
@Entity
@Table(name = "refresh_token")
@Getter
@Setter
public class RefreshToken extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String token_hash;

    @Column(nullable = false)
    private Long account_id;

    // ADMIN, BAILLEUR ou LOCATAIRE
    @Column(nullable = false, length = 20)
    private String role;

    @Column(nullable = false)
    private Instant expires_at;

    @Column(nullable = false)
    private boolean revoked;
}
