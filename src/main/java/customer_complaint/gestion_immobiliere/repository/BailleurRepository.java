package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Bailleur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BailleurRepository extends JpaRepository<Bailleur, Long> {

    Optional<Bailleur> findByEmail(String email);
}
