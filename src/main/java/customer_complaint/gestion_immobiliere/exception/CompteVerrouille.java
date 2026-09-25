package customer_complaint.gestion_immobiliere.exception;

import lombok.Getter;

// donne un 429 avec Retry-After / maps to 429 with Retry-After
@Getter
public class CompteVerrouille extends RuntimeException {

    private final long retry_after_seconds;

    public CompteVerrouille(long retry_after_seconds) {
        super("Trop de tentatives échouées : connexion temporairement bloquée, réessayez dans "
                + Math.max(1, (retry_after_seconds + 59) / 60) + " minute(s)");
        this.retry_after_seconds = retry_after_seconds;
    }
}
