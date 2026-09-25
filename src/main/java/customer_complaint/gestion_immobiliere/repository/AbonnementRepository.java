package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Abonnement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {

    // "actuel" = pas resilie / "current" = not terminated
    @Query("select a from Abonnement a where a.bailleur.id = :bailleur_id and a.status <> 'RESILIE'")
    Optional<Abonnement> find_actuel(@Param("bailleur_id") Long bailleur_id);

    @Query("select a from Abonnement a where a.status <> 'RESILIE'")
    List<Abonnement> find_actuels();

    @Query("select a from Abonnement a order by a.created_at desc, a.id desc")
    List<Abonnement> find_tous();

    @Query("select count(a) from Abonnement a where a.plan.id = :plan_id and a.status <> 'RESILIE'")
    long count_actuels_by_plan(@Param("plan_id") Long plan_id);

    @Query("select count(a) from Abonnement a where a.plan.id = :plan_id")
    long count_by_plan(@Param("plan_id") Long plan_id);

    @Query("select a from Abonnement a where a.status = 'ACTIF' and a.next_billing_date <= :date")
    List<Abonnement> find_a_facturer(@Param("date") LocalDate date);
}
