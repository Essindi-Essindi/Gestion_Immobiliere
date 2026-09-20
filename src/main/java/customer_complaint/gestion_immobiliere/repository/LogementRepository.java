package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Logement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogementRepository extends JpaRepository<Logement, Long> {
}
