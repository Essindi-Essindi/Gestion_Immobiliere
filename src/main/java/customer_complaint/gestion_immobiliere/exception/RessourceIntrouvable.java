package customer_complaint.gestion_immobiliere.exception;

// donne un 404 / maps to 404
public class RessourceIntrouvable extends RuntimeException {

    public RessourceIntrouvable(String message) {
        super(message);
    }
}
