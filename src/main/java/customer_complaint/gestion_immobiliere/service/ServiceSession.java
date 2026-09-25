package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.RefreshToken;
import customer_complaint.gestion_immobiliere.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

// sessions = refresh tokens opaques, stockes hashes, a usage unique (rotation)
// sessions = opaque refresh tokens, stored hashed, single use (rotation)
@Service
@RequiredArgsConstructor
public class ServiceSession {

    public record Session(Long id, String token, String role, Long account_id) {
    }

    private final RefreshTokenRepository refresh_repository;

    @Value("${app.jwt.refresh-days:7}")
    private long refresh_days;

    @Transactional
    public Session creer(String role, Long account_id) {
        String token = Hachage.jeton_aleatoire();

        RefreshToken refresh = new RefreshToken();
        refresh.setToken_hash(Hachage.sha256(token));
        refresh.setAccount_id(account_id);
        refresh.setRole(role);
        refresh.setExpires_at(Instant.now().plus(Duration.ofDays(refresh_days)));
        refresh_repository.save(refresh);
        return new Session(refresh.getId(), token, role, account_id);
    }

    // noRollbackFor: la revocation en cas de reutilisation doit etre gardee / reuse revocation must be kept
    @Transactional(noRollbackFor = AuthenticationException.class)
    public Session renouveler(String token) {
        RefreshToken refresh = refresh_repository.find_by_hash(Hachage.sha256(token))
                .orElseThrow(() -> new BadCredentialsException("Jeton de rafraîchissement invalide"));

        // edge case: jeton deja utilise = vol probable, on coupe toutes les sessions du compte
        // already used token = probable theft, revoke every session of the account
        if (refresh.isRevoked()) {
            refresh_repository.revoke_all(refresh.getAccount_id(), refresh.getRole());
            throw new BadCredentialsException("Jeton de rafraîchissement déjà utilisé");
        }
        if (!refresh.getExpires_at().isAfter(Instant.now())) {
            throw new BadCredentialsException("Jeton de rafraîchissement expiré");
        }
        refresh.setRevoked(true);
        return creer(refresh.getRole(), refresh.getAccount_id());
    }

    // idempotent: un jeton inconnu ne provoque pas d'erreur / unknown token is not an error
    @Transactional
    public void revoquer(String token) {
        refresh_repository.find_by_hash(Hachage.sha256(token)).ifPresent(t -> t.setRevoked(true));
    }

    // apres un changement de mot de passe / after a password change
    @Transactional
    public void revoquer_compte(String role, Long account_id) {
        refresh_repository.revoke_all(account_id, role);
    }

    @Transactional(readOnly = true)
    public boolean active(Long session_id) {
        return refresh_repository.session_active(session_id, Instant.now());
    }
}
