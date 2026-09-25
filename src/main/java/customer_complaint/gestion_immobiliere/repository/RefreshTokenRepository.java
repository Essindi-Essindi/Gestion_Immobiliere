package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    @Query("select t from RefreshToken t where t.token_hash = :hash")
    Optional<RefreshToken> find_by_hash(@Param("hash") String hash);

    @Query("select count(t) > 0 from RefreshToken t where t.id = :id and t.revoked = false and t.expires_at > :now")
    boolean session_active(@Param("id") Long id, @Param("now") Instant now);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update RefreshToken t set t.revoked = true where t.account_id = :account_id and t.role = :role")
    int revoke_all(@Param("account_id") Long account_id, @Param("role") String role);
}
