package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Logement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LogementRepository extends JpaRepository<Logement, Long> {

    @Query("select l from Logement l where l.bailleur.id = :bailleur_id")
    List<Logement> find_by_bailleur(@Param("bailleur_id") Long bailleur_id);

    @Query("select count(l) from Logement l where l.bailleur.id = :bailleur_id")
    long count_by_bailleur(@Param("bailleur_id") Long bailleur_id);

    @Query("select l.bailleur.id, count(l) from Logement l group by l.bailleur.id")
    List<Object[]> compter_par_bailleur();
}
