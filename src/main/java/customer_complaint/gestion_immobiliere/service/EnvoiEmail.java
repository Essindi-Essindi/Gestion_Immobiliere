package customer_complaint.gestion_immobiliere.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

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

    // le bailleur a donne un mot de passe temporaire : on ne l'envoie jamais par e-mail
    @Async
    public void envoyer_compte_cree(String destinataire, String invitant) {
        envoyer(destinataire, "Votre accès à la plateforme de gestion locative",
                "Bonjour,\n\n" + invitant + " a créé votre compte locataire.\n"
                        + "Connectez-vous avec le mot de passe temporaire qu'il/elle vous a communiqué : "
                        + "il vous sera demandé d'en choisir un nouveau dès la première connexion.\n\n"
                        + "Si vous ne connaissez pas cette personne, ignorez ce message.", null);
    }

    @Async
    public void envoyer_rappel_loyer(String destinataire, String periode, double montant, String logement,
                                     String bailleur) {
        envoyer(destinataire, "Rappel : loyer de " + periode,
                "Bonjour,\n\nSauf erreur de notre part, le loyer de " + periode + " (" + montant
                        + " FCFA) pour le logement " + logement + " n'a pas encore été réglé.\n"
                        + "Merci de régulariser votre situation.\n\n" + bailleur
                        + "\n\nSi vous avez déjà payé, ignorez ce message.", null);
    }

    @Async
    public void envoyer_alerte_mot_de_passe(String destinataire) {
        envoyer(destinataire, "Votre mot de passe a été modifié",
                "Bonjour,\n\nLe mot de passe de votre compte vient d'être modifié et toutes vos sessions ont été "
                        + "fermées.\nSi ce n'est pas vous, utilisez « Mot de passe oublié » immédiatement.", null);
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
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(destinataire);
            message.setSubject(sujet);
            message.setText(texte);
            sender.send(message);
        } catch (Exception e) {
            log.error("Échec d'envoi de l'e-mail « {} »", sujet, e);
        }
    }
}
