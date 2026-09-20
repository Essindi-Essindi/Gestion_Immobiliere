package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Quittance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuittanceRepository extends JpaRepository<Quittance, Long> {
}
