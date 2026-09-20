package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignalementRepository extends JpaRepository<Signalement, Long> {
}
