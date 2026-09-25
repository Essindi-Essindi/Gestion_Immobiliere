package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.DocumentPdf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DocumentPdfRepository extends JpaRepository<DocumentPdf, Long> {

    @Query("select d from DocumentPdf d where d.type = :type and d.ref_id = :ref_id")
    Optional<DocumentPdf> find_by_ref(@Param("type") String type, @Param("ref_id") Long ref_id);

    @Query("select d.ref_id from DocumentPdf d, Contrat c where d.type = 'CONTRAT' and d.insere = true"
            + " and c.id = d.ref_id and c.bailleur.id = :bailleur_id")
    List<Long> contrats_inseres(@Param("bailleur_id") Long bailleur_id);

    @Query("select d.ref_id from DocumentPdf d, Quittance q where d.type = 'QUITTANCE' and d.insere = true"
            + " and q.id = d.ref_id and q.contrat.bailleur.id = :bailleur_id")
    List<Long> quittances_inserees(@Param("bailleur_id") Long bailleur_id);
}
