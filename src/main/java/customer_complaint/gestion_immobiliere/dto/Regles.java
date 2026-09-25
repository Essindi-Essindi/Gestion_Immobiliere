package customer_complaint.gestion_immobiliere.dto;

// regex partagees par les DTO / regexes shared by the DTOs
public final class Regles {

    public static final String email = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$";
    public static final String phone = "^[+0-9 ().-]{6,20}$";
    public static final String period = "^\\d{4}-(0[1-9]|1[0-2])$";

    private Regles() {
    }
}
