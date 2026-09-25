package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.JournalAudit;

import java.time.LocalDateTime;

// type : LOGIN, CREATE, UPDATE ou DELETE ; action : code precis (LOGIN_ECHEC, COMPTE_SUSPENDU...)
public record JournalResponse(Long id, LocalDateTime date, String user, String actor_role, Long actor_id,
                              String type, String action, String details, String target_type, Long target_id,
                              String ip) {

    public static JournalResponse from(JournalAudit journal) {
        return new JournalResponse(journal.getId(), journal.getCreated_at(), journal.getActor_name(),
                journal.getActor_role(), journal.getActor_id(), journal.getType(), journal.getAction(),
                journal.getDetails(), journal.getTarget_type(), journal.getTarget_id(), journal.getIp());
    }
}
