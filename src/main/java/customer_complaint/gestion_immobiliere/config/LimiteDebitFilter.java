package customer_complaint.gestion_immobiliere.config;

import customer_complaint.gestion_immobiliere.service.LimiteurDebit;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.Duration;

// volontairement pas un @Component : il est ajoute uniquement dans la chaine de securite (sinon double enregistrement)
// deliberately not a @Component: added only to the security chain (otherwise registered twice)
public class LimiteDebitFilter extends OncePerRequestFilter {

    private final LimiteurDebit limiteur;
    private final ObjectMapper mapper;
    private final int login_max;
    private final Duration login_fenetre;
    private final int reset_max;
    private final Duration reset_fenetre;

    public LimiteDebitFilter(LimiteurDebit limiteur, ObjectMapper mapper, int login_max, Duration login_fenetre,
                             int reset_max, Duration reset_fenetre) {
        this.limiteur = limiteur;
        this.mapper = mapper;
        this.login_max = login_max;
        this.login_fenetre = login_fenetre;
        this.reset_max = reset_max;
        this.reset_fenetre = reset_fenetre;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        long attente = 0;
        if ("POST".equals(request.getMethod())) {
            String ip = request.getRemoteAddr();
            switch (request.getRequestURI()) {
                case "/api/authentification/login", "/api/authentification/refresh" ->
                        attente = limiteur.essayer("login:" + ip, login_max, login_fenetre);
                case "/api/authentification/forgot-password", "/api/authentification/reset-password" ->
                        attente = limiteur.essayer("reset:" + ip, reset_max, reset_fenetre);
                default -> {
                }
            }
        }
        if (attente > 0) {
            EcritureErreur.ecrire(mapper, request, response, HttpStatus.TOO_MANY_REQUESTS,
                    "Trop de requêtes, réessayez dans " + attente + " seconde(s)", attente);
            return;
        }
        chain.doFilter(request, response);
    }
}
