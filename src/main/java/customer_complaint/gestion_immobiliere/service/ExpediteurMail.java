package customer_complaint.gestion_immobiliere.service;

// canal d'envoi des e-mails : SMTP (local) ou API Brevo (Render bloque le SMTP sortant)
// e-mail channel: SMTP (local) or Brevo API (Render blocks outgoing SMTP)
public interface ExpediteurMail {

    // faux si aucun serveur n'est configure / false when no server is configured
    boolean disponible();

    // html et piece jointe sont facultatifs / html and attachment are optional
    void envoyer(String destinataire, String sujet, String texte, String html, String nom_piece, byte[] piece)
            throws Exception;
}
