package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FactureRepository extends JpaRepository<Facture, Long> {

    @Query("select f from Facture f order by f.issued_on desc, f.id desc")
    List<Facture> find_toutes();

    @Query("select count(f) > 0 from Facture f where f.abonnement.id = :abonnement_id and f.period = :period")
    boolean existe(@Param("abonnement_id") Long abonnement_id, @Param("period") String period);

    // revenus de la plateforme = factures payees de la periode / platform revenue = paid invoices of the period
    @Query("select coalesce(sum(f.amount), 0) from Facture f where f.period = :period and f.status = 'PAYEE'")
    double revenus(@Param("period") String period);
}
