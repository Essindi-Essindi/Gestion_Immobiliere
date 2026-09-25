package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.exception.CompteVerrouille;
import customer_complaint.gestion_immobiliere.model.TentativeConnexion;
import customer_complaint.gestion_immobiliere.repository.TentativeConnexionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

// blocage temporaire apres trop d'echecs / temporary lock after too many failures
@Service
@RequiredArgsConstructor
public class ServiceVerrouillage {

    private final TentativeConnexionRepository tentative_repository;

    @Value("${app.security.max-attempts:5}")
    private int max_attempts;

    @Value("${app.security.lock-minutes:15}")
    private long lock_minutes;

    @Transactional(readOnly = true)
    public void verifier(String email) {
        tentative_repository.findByEmail(email).ifPresent(t -> {
            Instant until = t.getLocked_until();
            if (until != null && until.isAfter(Instant.now())) {
                throw new CompteVerrouille(Duration.between(Instant.now(), until).getSeconds());
            }
        });
    }

    @Transactional
    public void echec(String email) {
        Instant now = Instant.now();
        TentativeConnexion tentative = tentative_repository.findByEmail(email).orElseGet(() -> {
            TentativeConnexion neuve = new TentativeConnexion();
            neuve.setEmail(email);
            return neuve;
        });
        // edge case: blocage expire = on repart de zero / lock expired = start over
        if (tentative.getLocked_until() != null && !tentative.getLocked_until().isAfter(now)) {
            tentative.setFailed_count(0);
            tentative.setLocked_until(null);
        }
        tentative.setFailed_count(tentative.getFailed_count() + 1);
        if (tentative.getFailed_count() >= max_attempts) {
            tentative.setLocked_until(now.plus(Duration.ofMinutes(lock_minutes)));
        }
        tentative_repository.save(tentative);
    }

    @Transactional
    public void succes(String email) {
        tentative_repository.findByEmail(email).ifPresent(tentative_repository::delete);
    }
}
