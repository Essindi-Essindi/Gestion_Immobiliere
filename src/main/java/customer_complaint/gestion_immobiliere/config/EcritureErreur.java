package customer_complaint.gestion_immobiliere.config;

import customer_complaint.gestion_immobiliere.exception.ErreurReponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

// les erreurs levees par les filtres n'atteignent pas @RestControllerAdvice : on ecrit le meme JSON a la main
// filter errors bypass @RestControllerAdvice: write the same JSON by hand
public final class EcritureErreur {

    private EcritureErreur() {
    }

    public static void ecrire(ObjectMapper mapper, HttpServletRequest request, HttpServletResponse response,
                              HttpStatus status, String message, Long retry_after) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        if (retry_after != null) {
            response.setHeader("Retry-After", String.valueOf(retry_after));
        }
        ErreurReponse corps = ErreurReponse.of(status.value(), status.getReasonPhrase(), message,
                request.getRequestURI(), null);
        response.getWriter().write(mapper.writeValueAsString(corps));
    }
}
