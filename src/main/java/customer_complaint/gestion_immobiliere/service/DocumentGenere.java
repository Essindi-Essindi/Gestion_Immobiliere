package customer_complaint.gestion_immobiliere.service;

// evenement publie quand un PDF vient d'etre enregistre ; l'e-mail part APRES la validation de la transaction
// published when a PDF was just saved; the email leaves AFTER the transaction commits
public record DocumentGenere(Long document_id) {
}
