package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Locataire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LocataireRepository extends JpaRepository<Locataire, Long> {

    Optional<Locataire> findByEmail(String email);
}
