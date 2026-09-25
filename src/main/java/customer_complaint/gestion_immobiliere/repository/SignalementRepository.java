package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SignalementRepository extends JpaRepository<Signalement, Long> {

    @Query("select s from Signalement s where s.logement.bailleur.id = :bailleur_id")
    List<Signalement> find_by_bailleur(@Param("bailleur_id") Long bailleur_id);

    @Query("select s from Signalement s where s.locataire.id = :locataire_id order by s.created_at desc, s.id desc")
    List<Signalement> find_by_locataire(@Param("locataire_id") Long locataire_id);
}
