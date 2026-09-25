package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.PlanAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanAbonnementRepository extends JpaRepository<PlanAbonnement, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
