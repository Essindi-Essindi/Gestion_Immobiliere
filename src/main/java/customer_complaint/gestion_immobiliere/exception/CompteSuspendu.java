package customer_complaint.gestion_immobiliere.exception;

// donne un 403 : mot de passe correct mais compte suspendu / maps to 403: correct password but suspended account
public class CompteSuspendu extends RuntimeException {

    public CompteSuspendu() {
        super("Ce compte est suspendu. Contactez le support de la plateforme.");
    }
}
