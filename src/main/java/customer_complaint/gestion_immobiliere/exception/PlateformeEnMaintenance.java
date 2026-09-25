package customer_complaint.gestion_immobiliere.exception;

// donne un 503 : mode maintenance, seuls les admins se connectent / maps to 503: maintenance mode, only admins can log in
public class PlateformeEnMaintenance extends RuntimeException {

    public PlateformeEnMaintenance() {
        super("La plateforme est en maintenance. Réessayez plus tard.");
    }
}
