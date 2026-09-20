package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContratRepository extends JpaRepository<Contrat, Long> {
}
