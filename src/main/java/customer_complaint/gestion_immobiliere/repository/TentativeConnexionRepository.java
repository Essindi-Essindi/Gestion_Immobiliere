package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.TentativeConnexion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TentativeConnexionRepository extends JpaRepository<TentativeConnexion, Long> {

    Optional<TentativeConnexion> findByEmail(String email);
}
