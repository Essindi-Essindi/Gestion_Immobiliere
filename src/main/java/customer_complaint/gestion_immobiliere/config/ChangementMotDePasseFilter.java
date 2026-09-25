package customer_complaint.gestion_immobiliere.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

// tant que le locataire n'a pas choisi son mot de passe, son jeton ne donne acces a rien d'autre
// until the tenant picks their password, their token opens nothing else (like a "first login" gate)
public class ChangementMotDePasseFilter extends OncePerRequestFilter {

    private final ObjectMapper mapper;

    public ChangementMotDePasseFilter(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean doit_changer = authentication instanceof JwtAuthenticationToken jeton
                && Boolean.TRUE.equals(jeton.getToken().getClaim("pwd_change"));

        // /api/authentification/** porte change-password et ses propres regles / holds change-password and its own rules
        if (doit_changer && !request.getRequestURI().startsWith("/api/authentification/")) {
            // en-tete lisible par le front pour rediriger vers l'ecran de changement / lets the front redirect
            response.setHeader("X-Auth-Action", "password-change-required");
            EcritureErreur.ecrire(mapper, request, response, HttpStatus.FORBIDDEN,
                    "Vous devez d'abord choisir un nouveau mot de passe", null);
            return;
        }
        chain.doFilter(request, response);
    }
}
