package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.DocumentResponse;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.ArrayList;
import java.util.List;

// envoie le PDF au bailleur ET au locataire ; volontairement PAS transactionnel : aucune connexion base n'est bloquee pendant
// que le serveur SMTP repond, et l'echec d'un envoi n'annule jamais le document deja enregistre
// sends the PDF to landlord AND tenant; deliberately NOT transactional: no DB connection is held while SMTP answers,
// and a failed send never rolls back the already-saved document
@Component
@Slf4j
public class EnvoiDocument {

    private final ServiceDocument service_document;
    private final ObjectProvider<JavaMailSender> mail_sender;
    private final String from;

    public EnvoiDocument(ServiceDocument service_document, ObjectProvider<JavaMailSender> mail_sender,
                         @Value("${app.mail.from:no-reply@gestion-immobiliere.local}") String from) {
        this.service_document = service_document;
        this.mail_sender = mail_sender;
        this.from = from;
    }

    // declenche automatiquement apres la creation du contrat / de la quittance / triggered automatically after creation
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void apres_creation(DocumentGenere evenement) {
        executer(evenement.document_id());
    }

    // relance manuelle : n'envoie qu'aux destinataires qui n'ont pas encore recu le document
    // manual retry: only sends to recipients who have not received the document yet
    public DocumentResponse renvoyer(String type, Long ref_id) {
        Long id = service_document.id_document_bailleur(type, ref_id);
        executer(id);
        return service_document.statut(type, ref_id);
    }

    private void executer(Long document_id) {
        try {
            ServiceDocument.EnvoiPrepare envoi = service_document.preparer_envoi(document_id);
            boolean bailleur_ok = envoi.sent_bailleur();
            boolean locataire_ok = envoi.sent_locataire();
            List<String> erreurs = new ArrayList<>();

            // chaque destinataire a son propre message : l'echec de l'un ne bloque pas l'autre
            // one message per recipient: one failing does not block the other
            if (!bailleur_ok) {
                try {
                    envoyer(envoi, envoi.bailleur_email(), envoi.bailleur_nom());
                    bailleur_ok = true;
                } catch (Exception e) {
                    erreurs.add("bailleur : " + resume(e));
                    log.warn("Envoi du document {} au bailleur impossible : {}", document_id, e.toString());
                }
            }
            if (!locataire_ok) {
                try {
                    envoyer(envoi, envoi.locataire_email(), envoi.locataire_nom());
                    locataire_ok = true;
                } catch (Exception e) {
                    erreurs.add("locataire : " + resume(e));
                    log.warn("Envoi du document {} au locataire impossible : {}", document_id, e.toString());
                }
            }
            service_document.enregistrer_resultat(document_id, bailleur_ok, locataire_ok, String.join(" | ", erreurs));
        } catch (RuntimeException e) {
            // meme une panne inattendue ne doit pas toucher au document / even an unexpected failure must not touch the document
            log.error("Traitement d'envoi du document {} en erreur", document_id, e);
        }
    }

    private void envoyer(ServiceDocument.EnvoiPrepare envoi, String destinataire, String nom) throws MessagingException {
        JavaMailSender sender = mail_sender.getIfAvailable();
        if (sender == null) {
            throw new IllegalStateException("SMTP non configuré (SPRING_MAIL_HOST)");
        }
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(from);
        helper.setTo(destinataire);
        helper.setSubject(envoi.sujet());
        helper.setText("Bonjour " + nom + ",\n\nVeuillez trouver ci-joint " + envoi.description() + ".\n\n"
                + "Ce document reste disponible à tout moment dans votre espace personnel.\n");
        helper.addAttachment(envoi.file_name(), new ByteArrayResource(envoi.contenu()), "application/pdf");
        sender.send(message);
    }

    // message court : sans trace de pile, sans donnee sensible / short message: no stack trace, nothing sensitive
    private static String resume(Exception e) {
        String message = e.getMessage() == null ? "" : e.getMessage().replaceAll("\\s+", " ").trim();
        return e.getClass().getSimpleName() + (message.isEmpty() ? "" : " : " + message);
    }
}
