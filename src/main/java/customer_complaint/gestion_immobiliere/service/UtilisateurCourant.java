package customer_complaint.gestion_immobiliere.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

// qui est connecte, lu dans le JWT / who is logged in, read from the JWT
@Component
public class UtilisateurCourant {

    public Long id() {
        Object uid = jwt().getClaim("uid");
        if (uid instanceof Number n) {
            return n.longValue();
        }
        throw new AccessDeniedException("Jeton sans identifiant de compte");
    }

    public String role() {
        return jwt().getClaim("role");
    }

    public boolean admin() {
        return "ADMIN".equals(role());
    }

    public boolean bailleur() {
        return "BAILLEUR".equals(role());
    }

    public boolean locataire() {
        return "LOCATAIRE".equals(role());
    }

    private Jwt jwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt;
        }
        throw new AccessDeniedException("Authentification requise");
    }
}
