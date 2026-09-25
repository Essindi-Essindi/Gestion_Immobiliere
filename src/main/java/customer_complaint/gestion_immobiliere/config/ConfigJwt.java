package customer_complaint.gestion_immobiliere.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import customer_complaint.gestion_immobiliere.service.ServiceSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
public class ConfigJwt {

    public static final String issuer = "gestion-immobiliere";

    // le secret vient de JWT_SECRET, jamais du code / the secret comes from JWT_SECRET, never from code
    @Bean
    public SecretKey jwt_key(@Value("${app.jwt.secret}") String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET est trop court : 32 caractères minimum");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    public JwtEncoder jwt_encoder(SecretKey jwt_key) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwt_key));
    }

    @Bean
    public JwtDecoder jwt_decoder(SecretKey jwt_key, ServiceSession service_session) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(jwt_key).macAlgorithm(MacAlgorithm.HS256).build();

        // le jeton n'est valide que si sa session n'est ni revoquee ni expiree / token valid only while its session is
        OAuth2TokenValidator<Jwt> session_valide = jwt -> {
            Object sid = jwt.getClaim("sid");
            if (sid instanceof Number n && service_session.active(n.longValue())) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Session expirée ou révoquée", null));
        };
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(issuer), session_valide));
        return decoder;
    }
}
