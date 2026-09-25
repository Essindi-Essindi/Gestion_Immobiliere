package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ContratRepository extends JpaRepository<Contrat, Long> {

    @Query("select c from Contrat c where c.locataire.id = :locataire_id order by c.start_date desc")
    List<Contrat> find_by_locataire(@Param("locataire_id") Long locataire_id);

    @Query("select c from Contrat c where c.bailleur.id = :bailleur_id order by c.start_date desc")
    List<Contrat> find_by_bailleur(@Param("bailleur_id") Long bailleur_id);

    @Query("select c from Contrat c where c.logement.id = :logement_id")
    List<Contrat> find_by_logement(@Param("logement_id") Long logement_id);

    // en cours aujourd'hui = commence et pas fini / ongoing today = started and not ended
    @Query("select c from Contrat c where c.bailleur.id = :bailleur_id and c.start_date <= current_date "
            + "and (c.end_date is null or c.end_date >= current_date)")
    List<Contrat> find_actifs_by_bailleur(@Param("bailleur_id") Long bailleur_id);

    @Query("select c from Contrat c where c.logement.id in :logement_ids and c.start_date <= current_date "
            + "and (c.end_date is null or c.end_date >= current_date)")
    List<Contrat> find_actifs_by_logements(@Param("logement_ids") Collection<Long> logement_ids);

    // contrat en cours ou a venir (sert au signalement) / ongoing or upcoming (used by issue reports)
    @Query("select count(c) > 0 from Contrat c where c.locataire.id = :locataire_id "
            + "and c.logement.id = :logement_id and (c.end_date is null or c.end_date >= current_date)")
    boolean locataire_lie_au_logement(@Param("locataire_id") Long locataire_id,
                                      @Param("logement_id") Long logement_id);

    @Query("select count(c) from Contrat c where c.start_date <= current_date and (c.end_date is null or c.end_date >= current_date)")
    long count_actifs();
}
