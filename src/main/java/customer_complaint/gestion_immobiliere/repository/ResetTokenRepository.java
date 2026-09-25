package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.ResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ResetTokenRepository extends JpaRepository<ResetToken, Long> {

    @Query("select t from ResetToken t where t.token_hash = :hash")
    Optional<ResetToken> find_by_hash(@Param("hash") String hash);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update ResetToken t set t.used = true where t.account_id = :account_id and t.role = :role and t.used = false")
    int invalidate_all(@Param("account_id") Long account_id, @Param("role") String role);
}
