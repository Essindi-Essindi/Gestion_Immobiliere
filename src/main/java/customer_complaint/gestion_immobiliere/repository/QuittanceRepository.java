package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Quittance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuittanceRepository extends JpaRepository<Quittance, Long> {

    @Query("select count(q) > 0 from Quittance q where q.contrat.id = :contrat_id and q.period = :period")
    boolean existe_pour_periode(@Param("contrat_id") Long contrat_id, @Param("period") String period);

    @Query("select q from Quittance q where q.contrat.bailleur.id = :bailleur_id")
    List<Quittance> find_by_bailleur(@Param("bailleur_id") Long bailleur_id);

    @Query("select q from Quittance q where q.contrat.locataire.id = :locataire_id order by q.period desc, q.id desc")
    List<Quittance> find_by_locataire(@Param("locataire_id") Long locataire_id);
}
