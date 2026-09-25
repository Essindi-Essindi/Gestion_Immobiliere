package customer_complaint.gestion_immobiliere.exception;

// donne un 409 / maps to 409
public class ConflitDonnees extends RuntimeException {

    public ConflitDonnees(String message) {
        super(message);
    }
}
