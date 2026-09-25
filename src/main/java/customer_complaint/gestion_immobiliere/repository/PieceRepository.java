package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Piece;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PieceRepository extends JpaRepository<Piece, Long> {
}
