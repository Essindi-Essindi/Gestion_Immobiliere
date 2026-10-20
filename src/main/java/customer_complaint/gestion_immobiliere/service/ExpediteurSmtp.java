package customer_complaint.gestion_immobiliere.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "smtp", matchIfMissing = true)
public class ExpediteurSmtp implements ExpediteurMail {

    private final ObjectProvider<JavaMailSender> mail_sender;
    private final String from;
    private final String from_name;

    public ExpediteurSmtp(ObjectProvider<JavaMailSender> mail_sender,
                          @Value("${app.mail.from:no-reply@gestion-immobiliere.local}") String from,
                          @Value("${app.mail.from-name:Gestion Immobilière}") String from_name) {
        this.mail_sender = mail_sender;
        this.from = from;
        this.from_name = from_name;
    }

    @Override
    public boolean disponible() {
        return mail_sender.getIfAvailable() != null;
    }

    @Override
    public void envoyer(String destinataire, String sujet, String texte, String html, String nom_piece, byte[] piece)
            throws Exception {
        JavaMailSender sender = mail_sender.getIfAvailable();
        if (sender == null) {
            throw new IllegalStateException("SMTP non configuré (SPRING_MAIL_HOST)");
        }
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        // nom d'affichage + reply-to + version html : moins de spam / display name + reply-to + html part: less spam
        helper.setFrom(from, from_name);
        helper.setReplyTo(from);
        helper.setTo(destinataire);
        helper.setSubject(sujet);
        if (html != null) {
            helper.setText(texte, html);
        } else {
            helper.setText(texte);
        }
        if (piece != null) {
            helper.addAttachment(nom_piece, new ByteArrayResource(piece), "application/pdf");
        }
        sender.send(message);
    }
}
