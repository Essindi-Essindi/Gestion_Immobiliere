package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.config.ConfigJwt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

// fabrique le JWT d'acces (courte duree) / builds the short-lived access JWT
@Service
public class JetonService {

    private final JwtEncoder jwt_encoder;
    private final long access_minutes;

    public JetonService(JwtEncoder jwt_encoder, @Value("${app.jwt.access-minutes:15}") long access_minutes) {
        this.jwt_encoder = jwt_encoder;
        this.access_minutes = access_minutes;
    }

    public String creer(String role, Long account_id, String email, Long session_id, boolean must_change) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ConfigJwt.issuer)
                .subject(email)
                .issuedAt(now)
                .expiresAt(now.plus(Duration.ofMinutes(access_minutes)))
                .id(UUID.randomUUID().toString())
                .claim("uid", account_id)
                .claim("role", role)
                // lie le jeton a sa session : logout = jeton mort / ties the token to its session
                .claim("sid", session_id)
                // tant que vrai, seul le changement de mot de passe est autorise (voir ChangementMotDePasseFilter)
                .claim("pwd_change", must_change)
                .build();
        return jwt_encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
    }

    public long expires_in() {
        return access_minutes * 60;
    }
}
