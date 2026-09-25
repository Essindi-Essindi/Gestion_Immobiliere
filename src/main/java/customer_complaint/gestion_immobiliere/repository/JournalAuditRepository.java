package customer_complaint.gestion_immobiliere.repository;

import customer_complaint.gestion_immobiliere.model.JournalAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface JournalAuditRepository extends JpaRepository<JournalAudit, Long> {

    // aucun parametre nul : "" = pas de filtre, et des dates bornes larges / no null params: "" = no filter, wide date bounds
    @Query("select j from JournalAudit j where (:type = '' or j.type = :type) "
            + "and (lower(j.actor_name) like :q or lower(j.details) like :q or lower(j.action) like :q "
            + "or coalesce(j.ip, '') like :q) "
            + "and j.created_at >= :depuis and j.created_at < :jusqua")
    Page<JournalAudit> rechercher(@Param("type") String type, @Param("q") String q,
                                  @Param("depuis") LocalDateTime depuis, @Param("jusqua") LocalDateTime jusqua,
                                  Pageable pageable);
}
