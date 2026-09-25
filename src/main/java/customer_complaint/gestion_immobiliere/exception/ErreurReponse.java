package customer_complaint.gestion_immobiliere.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

// format unique de toutes les erreurs de l'API / single error format for the whole API
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErreurReponse(LocalDateTime timestamp, int status, String error, String message, String path,
                            List<ErreurChamp> details) {

    public record ErreurChamp(String field, String message) {
    }

    public static ErreurReponse of(int status, String error, String message, String path, List<ErreurChamp> details) {
        return new ErreurReponse(LocalDateTime.now(), status, error, message, path, details);
    }
}
