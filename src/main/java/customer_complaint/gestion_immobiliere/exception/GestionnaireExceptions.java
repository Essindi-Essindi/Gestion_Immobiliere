package customer_complaint.gestion_immobiliere.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.TypeMismatchException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;

// etend le handler Spring pour que 404/405/415... aient le meme format / extends Spring's handler so 404/405/415... share the format
@RestControllerAdvice
@Slf4j
public class GestionnaireExceptions extends ResponseEntityExceptionHandler {

    @ExceptionHandler(RequeteInvalide.class)
    public ResponseEntity<Object> requete_invalide(RequeteInvalide ex, HttpServletRequest request) {
        return reponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler({AuthenticationException.class})
    public ResponseEntity<Object> non_authentifie(AuthenticationException ex, HttpServletRequest request) {
        return reponse(HttpStatus.UNAUTHORIZED, "Authentification requise ou identifiants incorrects",
                request.getRequestURI(), null);
    }

    @ExceptionHandler(CompteVerrouille.class)
    public ResponseEntity<Object> verrouille(CompteVerrouille ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.TOO_MANY_REQUESTS;
        ErreurReponse corps = ErreurReponse.of(status.value(), status.getReasonPhrase(), ex.getMessage(),
                request.getRequestURI(), null);
        return ResponseEntity.status(status)
                .header(HttpHeaders.RETRY_AFTER, String.valueOf(ex.getRetry_after_seconds()))
                .body(corps);
    }

    @ExceptionHandler(CompteSuspendu.class)
    public ResponseEntity<Object> suspendu(CompteSuspendu ex, HttpServletRequest request) {
        return reponse(HttpStatus.FORBIDDEN, ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(PlateformeEnMaintenance.class)
    public ResponseEntity<Object> maintenance(PlateformeEnMaintenance ex, HttpServletRequest request) {
        return reponse(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> acces_refuse(AccessDeniedException ex, HttpServletRequest request) {
        return reponse(HttpStatus.FORBIDDEN, "Vous n'avez pas les droits pour cette action", request.getRequestURI(),
                null);
    }

    @ExceptionHandler(RessourceIntrouvable.class)
    public ResponseEntity<Object> introuvable(RessourceIntrouvable ex, HttpServletRequest request) {
        return reponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(ConflitDonnees.class)
    public ResponseEntity<Object> conflit(ConflitDonnees ex, HttpServletRequest request) {
        return reponse(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI(), null);
    }

    // filet de securite: contrainte SQL (unique, cle etrangere) ; message lisible, sans jargon technique
    // safety net: SQL constraint; readable message, no technical jargon
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> integrite(DataIntegrityViolationException ex, HttpServletRequest request) {
        String cause = String.valueOf(ex.getMostSpecificCause().getMessage()).toLowerCase();
        log.warn("Violation d'integrite : {}", cause);
        String message;
        if (cause.contains("duplicate") || cause.contains("unique")) {
            message = "Cette valeur existe déjà (adresse e-mail, numéro de pièce, période déjà enregistrée...)";
        } else if (cause.contains("too long") || cause.contains("value too long")) {
            message = "Une des valeurs saisies est trop longue";
        } else if (cause.contains("foreign key") || cause.contains("a foreign key constraint fails")) {
            message = "Action impossible : cet élément est encore utilisé ailleurs (contrat, locataire, signalement...)";
        } else {
            message = "Action impossible avec les informations saisies : vérifiez les champs et réessayez";
        }
        return reponse(HttpStatus.CONFLICT, message, request.getRequestURI(), null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> erreur_interne(Exception ex, HttpServletRequest request) {
        log.error("Erreur inattendue sur {}", request.getRequestURI(), ex);
        return reponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur interne du serveur", request.getRequestURI(), null);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                  HttpHeaders headers, HttpStatusCode status,
                                                                  WebRequest request) {
        List<ErreurReponse.ErreurChamp> details = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> new ErreurReponse.ErreurChamp(e.getField(), e.getDefaultMessage()))
                .toList();
        // les regles portees par la classe entiere (ex: dates) / class-level rules (e.g. dates)
        List<ErreurReponse.ErreurChamp> globaux = ex.getBindingResult().getGlobalErrors().stream()
                .map(e -> new ErreurReponse.ErreurChamp(e.getObjectName(), e.getDefaultMessage()))
                .toList();
        List<ErreurReponse.ErreurChamp> tous = new java.util.ArrayList<>(details);
        tous.addAll(globaux);
        return reponse(HttpStatus.BAD_REQUEST, "Les données envoyées sont invalides", chemin(request), tous);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
                                                                  HttpHeaders headers, HttpStatusCode status,
                                                                  WebRequest request) {
        return reponse(HttpStatus.BAD_REQUEST,
                "Corps de la requête illisible : JSON mal formé ou valeur invalide (ex: date au format AAAA-MM-JJ)",
                chemin(request), null);
    }

    @Override
    protected ResponseEntity<Object> handleNoResourceFoundException(NoResourceFoundException ex, HttpHeaders headers,
                                                                    HttpStatusCode status, WebRequest request) {
        return reponse(HttpStatus.NOT_FOUND, "Ressource introuvable : " + chemin(request), chemin(request), null);
    }

    @Override
    protected ResponseEntity<Object> handleTypeMismatch(TypeMismatchException ex, HttpHeaders headers,
                                                        HttpStatusCode status, WebRequest request) {
        return reponse(HttpStatus.BAD_REQUEST, "Paramètre '" + ex.getPropertyName() + "' invalide : valeur '"
                + ex.getValue() + "' inattendue", chemin(request), null);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
                                                             HttpStatusCode status, WebRequest request) {
        String message = body instanceof ProblemDetail pd && pd.getDetail() != null ? pd.getDetail() : ex.getMessage();
        return reponse(HttpStatus.valueOf(status.value()), message, chemin(request), null);
    }

    private static String chemin(WebRequest request) {
        return request instanceof ServletWebRequest swr ? swr.getRequest().getRequestURI() : "";
    }

    private static ResponseEntity<Object> reponse(HttpStatus status, String message, String path,
                                                  List<ErreurReponse.ErreurChamp> details) {
        ErreurReponse corps = ErreurReponse.of(status.value(), status.getReasonPhrase(), message, path, details);
        return ResponseEntity.status(status).body(corps);
    }
}
