package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Loyer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LoyerRepository extends JpaRepository<Loyer, Long> {

    @Query("select l from Loyer l where l.contrat.bailleur.id = :bailleur_id order by l.due_date desc, l.id desc")
    List<Loyer> find_by_bailleur(@Param("bailleur_id") Long bailleur_id);

    @Query("select l from Loyer l where l.contrat.locataire.id = :locataire_id order by l.due_date desc, l.id desc")
    List<Loyer> find_by_locataire(@Param("locataire_id") Long locataire_id);

    @Query("select l from Loyer l where l.contrat.id = :contrat_id")
    List<Loyer> find_by_contrat(@Param("contrat_id") Long contrat_id);
}
