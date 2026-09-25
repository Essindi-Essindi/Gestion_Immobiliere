package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.nio.charset.StandardCharsets;
import java.util.List;

public class MotDePasseValidator implements ConstraintValidator<MotDePasseValide, String> {

    private static final int min = 10;
    // BCrypt ignore/refuse au-dela de 72 octets / BCrypt limit
    private static final int max_octets = 72;
    private static final List<String> courants = List.of("password", "motdepasse", "azerty", "qwerty", "123456",
            "admin", "welcome", "letmein");

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        // null gere par @NotBlank ou par le service (ex: mise a jour sans changer le mot de passe)
        if (password == null) {
            return true;
        }
        if (password.length() < min || password.getBytes(StandardCharsets.UTF_8).length > max_octets) {
            return false;
        }
        boolean minuscule = false, majuscule = false, chiffre = false, special = false;
        for (char c : password.toCharArray()) {
            if (Character.isWhitespace(c)) {
                return false;
            }
            if (Character.isLowerCase(c)) minuscule = true;
            else if (Character.isUpperCase(c)) majuscule = true;
            else if (Character.isDigit(c)) chiffre = true;
            else special = true;
        }
        String bas = password.toLowerCase();
        return minuscule && majuscule && chiffre && special && courants.stream().noneMatch(bas::contains);
    }
}
