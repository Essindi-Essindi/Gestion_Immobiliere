package customer_complaint.gestion_immobiliere.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

// asynchrone : un e-mail lent ou absent ne doit pas reveler si le compte existe (temps de reponse)
// async: a slow/absent email must not reveal whether the account exists (response time)
@Component
@Slf4j
public class EnvoiEmail {

    private final ObjectProvider<JavaMailSender> mail_sender;
    private final String from;
    private final boolean log_link;
    private final ServiceParametres service_parametres;

    public EnvoiEmail(ObjectProvider<JavaMailSender> mail_sender,
                      @Value("${app.mail.from:no-reply@gestion-immobiliere.local}") String from,
                      @Value("${app.reset.log-link:false}") boolean log_link,
                      ServiceParametres service_parametres) {
        this.service_parametres = service_parametres;
        this.mail_sender = mail_sender;
        this.from = from;
        this.log_link = log_link;
    }

    @Async
    public void envoyer_reinitialisation(String destinataire, String lien, long minutes) {
        envoyer(destinataire, "Réinitialisation de votre mot de passe",
                "Bonjour,\n\nPour choisir un nouveau mot de passe, ouvrez ce lien (valable " + minutes
                        + " minutes, une seule utilisation) :\n" + lien
                        + "\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message : "
                        + "votre mot de passe actuel reste inchangé.", lien);
    }

    // le bailleur n'a choisi aucun mot de passe : le locataire le definit lui-meme via le lien
    @Async
    public void envoyer_invitation(String destinataire, String invitant, String lien, long heures) {
        envoyer(destinataire, "Votre accès à la plateforme de gestion locative",
                "Bonjour,\n\n" + invitant + " a créé votre compte locataire.\n"
                        + "Pour l'activer, choisissez votre mot de passe via ce lien (valable " + heures
                        + " heures, une seule utilisation) :\n" + lien
                        + "\n\nSi vous ne connaissez pas cette personne, ignorez ce message.", lien);
    }

    // le bailleur a choisi un mot de passe a usage unique : le locataire le recoit avec le lien de connexion
    // the landlord chose a one-time password: the tenant gets it with the login link
    @Async
    public void envoyer_compte_cree(String destinataire, String invitant, String mot_de_passe, String lien_connexion) {
        envoyer(destinataire, "Votre accès à la plateforme de gestion locative",
                "Bonjour,\n\n" + invitant + " a créé votre compte locataire.\n\n"
                        + "Lien de connexion :\n" + lien_connexion + "\n\n"
                        + "Identifiant : " + destinataire + "\n"
                        + "Mot de passe temporaire : " + mot_de_passe + "\n\n"
                        + "Ce mot de passe ne sert qu'une fois : dès votre première connexion, il vous sera "
                        + "demandé d'en choisir un nouveau, que personne d'autre ne connaîtra.\n\n"
                        + "Si vous ne connaissez pas cette personne, ignorez ce message.", lien_connexion);
    }

    @Async
    public void envoyer_rappel_loyer(String destinataire, String periode, double montant, String logement,
                                     String bailleur) {
        envoyer(destinataire, "Rappel : loyer de " + periode,
                "Bonjour,\n\nSauf erreur de notre part, le loyer de " + periode + " (" + montant
                        + " €) pour le logement " + logement + " n'a pas encore été réglé.\n"
                        + "Merci de régulariser votre situation.\n\n" + bailleur
                        + "\n\nSi vous avez déjà payé, ignorez ce message.", null);
    }

    // inscription en ligne : le compte est actif, le bailleur peut se connecter
    // online signup: the account is active, the landlord can log in
    @Async
    public void envoyer_bienvenue_bailleur(String destinataire, String prenom, String lien_connexion) {
        envoyer(destinataire, "Bienvenue sur la plateforme de gestion locative",
                "Bonjour " + prenom + ",\n\nVotre compte bailleur est créé et actif. Vous pouvez vous connecter dès "
                        + "maintenant :\n" + lien_connexion + "\n\nIdentifiant : " + destinataire
                        + "\n\nSi vous n'êtes pas à l'origine de cette inscription, ignorez ce message.",
                lien_connexion);
    }

    @Async
    public void envoyer_alerte_mot_de_passe(String destinataire) {
        envoyer(destinataire, "Votre mot de passe a été modifié",
                "Bonjour,\n\nLe mot de passe de votre compte vient d'être modifié et toutes vos sessions ont été "
                        + "fermées.\nSi ce n'est pas vous, utilisez « Mot de passe oublié » immédiatement.", null);
    }

    private String en_html(String texte, String lien) {
        String html = HtmlUtils.htmlEscape(texte).replace("\n", "<br>");
        if (lien != null) {
            String lien_echappe = HtmlUtils.htmlEscape(lien);
            html = html.replace(lien_echappe, "<a href=\"" + lien_echappe + "\">Ouvrir le lien</a>");
        }
        return "<html><body style=\"font-family:Arial,sans-serif;font-size:14px;color:#222\">" + html
                + "</body></html>";
    }

    private void envoyer(String destinataire, String sujet, String texte, String lien) {
        // dev uniquement : jamais en production, le lien est un secret / dev only: the link is a secret
        if (log_link && lien != null) {
            log.info("[DEV] lien envoyé à {} : {}", destinataire, lien);
        }
        JavaMailSender sender = mail_sender.getIfAvailable();
        if (sender == null) {
            log.warn("SMTP non configuré (SPRING_MAIL_HOST) : e-mail « {} » non envoyé", sujet);
            return;
        }
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            // nom d'affichage + reply-to + version html : moins de spam / display name + reply-to + html part: less spam
            helper.setFrom(from, "Gestion Immobilière");
            helper.setReplyTo(from);
            helper.setTo(destinataire);
            helper.setSubject(sujet);
            helper.setText(texte, en_html(texte, lien));
            sender.send(message);
        } catch (Exception e) {
            log.error("Échec d'envoi de l'e-mail « {} »", sujet, e);
        }
    }
}
