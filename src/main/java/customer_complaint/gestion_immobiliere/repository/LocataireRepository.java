package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Locataire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LocataireRepository extends JpaRepository<Locataire, Long> {

    Optional<Locataire> findByEmail(String email);

    boolean existsByEmail(String email);

    // un locataire est "a" un bailleur s'il l'a cree ou s'ils ont un contrat / tenant belongs to a landlord if created by them or linked by a contract
    @Query("select l from Locataire l where l.bailleur.id = :bailleur_id or exists "
            + "(select c.id from Contrat c where c.locataire = l and c.bailleur.id = :bailleur_id)")
    List<Locataire> list_pour_bailleur(@Param("bailleur_id") Long bailleur_id);

    @Query("select count(l) > 0 from Locataire l where l.id = :locataire_id and (l.bailleur.id = :bailleur_id or exists "
            + "(select c.id from Contrat c where c.locataire = l and c.bailleur.id = :bailleur_id))")
    boolean lie_au_bailleur(@Param("locataire_id") Long locataire_id, @Param("bailleur_id") Long bailleur_id);

    @Query("select count(l) from Locataire l where l.logement.id = :logement_id")
    long count_by_logement(@Param("logement_id") Long logement_id);

    long countByActive(boolean active);

    @Query("select count(l) from Locataire l where l.created_at >= :depuis")
    long count_crees_depuis(@Param("depuis") java.time.LocalDateTime depuis);

    // nombre de locataires crees par chaque bailleur / tenants created by each landlord
    @Query("select l.bailleur.id, count(l) from Locataire l where l.bailleur is not null group by l.bailleur.id")
    List<Object[]> compter_par_bailleur();
}
