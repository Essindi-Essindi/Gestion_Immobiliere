package customer_complaint.gestion_immobiliere.exception;

// regle metier non respectee, donne un 400 / business rule broken, maps to 400
public class RequeteInvalide extends RuntimeException {

    public RequeteInvalide(String message) {
        super(message);
    }
}
