package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Bailleur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BailleurRepository extends JpaRepository<Bailleur, Long> {

    Optional<Bailleur> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByActive(boolean active);

    @org.springframework.data.jpa.repository.Query("select count(b) from Bailleur b where b.created_at >= :depuis")
    long count_crees_depuis(@org.springframework.data.repository.query.Param("depuis") java.time.LocalDateTime depuis);
}
