package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.DocumentPdf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DocumentPdfRepository extends JpaRepository<DocumentPdf, Long> {

    @Query("select d from DocumentPdf d where d.type = :type and d.ref_id = :ref_id")
    Optional<DocumentPdf> find_by_ref(@Param("type") String type, @Param("ref_id") Long ref_id);
}
