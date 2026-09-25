package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.DocumentPdf;

import java.time.LocalDateTime;

// etat du document et de son envoi par e-mail (le contenu n'est jamais renvoye ici : voir /pdf)
// document and e-mail delivery state (the content is never returned here: see /pdf)
public record DocumentResponse(Long id, String type, Long ref_id, String file_name, long size_bytes,
                               LocalDateTime generated_at, String email_status, boolean sent_to_bailleur,
                               boolean sent_to_locataire, int attempts, String last_error, LocalDateTime sent_at,
                               boolean inserted) {

    public static DocumentResponse from(DocumentPdf document) {
        return new DocumentResponse(document.getId(), document.getType(), document.getRef_id(),
                document.getFile_name(), document.getSize_bytes(), document.getCreated_at(),
                document.getEmail_status(), document.isSent_bailleur(), document.isSent_locataire(),
                document.getAttempts(), document.getLast_error(), document.getSent_at(), document.isInsere());
    }
}
