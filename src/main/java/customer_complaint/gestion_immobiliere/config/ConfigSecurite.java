package customer_complaint.gestion_immobiliere.config;

import customer_complaint.gestion_immobiliere.service.LimiteurDebit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class ConfigSecurite {

    @Bean
    public PasswordEncoder password_encoder() {
        return new BCryptPasswordEncoder();
    }

    // seule l'URL d'Angular est autorisee, jamais "*" / only the Angular URL, never "*"
    // le nom du bean doit etre exactement "corsConfigurationSource" pour que Spring Security le trouve
    @Bean("corsConfigurationSource")
    public CorsConfigurationSource cors_source(@Value("${app.cors.origin:http://localhost:4200}") String origin) {
        List<String> origins = Arrays.stream(origin.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
        if (origins.isEmpty() || origins.stream().anyMatch(o -> o.contains("*"))) {
            throw new IllegalStateException("CORS_ORIGIN doit lister des URL précises, sans joker (*)");
        }
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(origins);
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        cors.setExposedHeaders(List.of("Retry-After", "X-Auth-Action", "Content-Disposition"));
        // jeton dans l'en-tete Authorization, aucun cookie : pas besoin des credentials
        cors.setAllowCredentials(false);
        cors.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }

    @Bean
    public SecurityFilterChain filter_chain(HttpSecurity http, ObjectMapper mapper, LimiteurDebit limiteur,
                                            @Value("${app.ratelimit.login.max:10}") int login_max,
                                            @Value("${app.ratelimit.login.window-seconds:60}") long login_fenetre,
                                            @Value("${app.ratelimit.reset.max:5}") int reset_max,
                                            @Value("${app.ratelimit.reset.window-seconds:900}") long reset_fenetre) {
        AuthenticationEntryPoint entry_point = (request, response, ex) ->
                EcritureErreur.ecrire(mapper, request, response, HttpStatus.UNAUTHORIZED,
                        "Authentification requise ou jeton invalide/expiré", null);
        org.springframework.security.web.access.AccessDeniedHandler denied_handler = (request, response, ex) ->
                EcritureErreur.ecrire(mapper, request, response, HttpStatus.FORBIDDEN,
                        "Vous n'avez pas les droits pour cette action", null);

        // claim "role" -> ROLE_ADMIN / ROLE_BAILLEUR / ROLE_LOCATAIRE
        JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName("role");
        authorities.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authorities);

        LimiteDebitFilter limite_debit = new LimiteDebitFilter(limiteur, mapper, login_max,
                Duration.ofSeconds(login_fenetre), reset_max, Duration.ofSeconds(reset_fenetre));

        // API sans session ni cookie, donc pas de CSRF / stateless API, no cookie, so no CSRF
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .headers(h -> h
                        // reponses JSON uniquement : rien ne doit etre charge ni encadre / JSON only: nothing to load or frame
                        .contentSecurityPolicy(c -> c.policyDirectives("default-src 'none'; frame-ancestors 'none'"))
                        .referrerPolicy(r -> r.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                        .httpStrictTransportSecurity(s -> s.includeSubDomains(true).maxAgeInSeconds(31536000))
                        .frameOptions(f -> f.deny()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(limite_debit, BearerTokenAuthenticationFilter.class)
                .addFilterAfter(new ChangementMotDePasseFilter(mapper), BearerTokenAuthenticationFilter.class)
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.POST, "/api/authentification/login",
                                "/api/authentification/refresh", "/api/authentification/logout",
                                "/api/authentification/forgot-password",
                                "/api/authentification/reset-password").permitAll()
                        // premiere barriere par espace, AVANT la validation du corps : un mauvais role recoit 403, pas 400
                        // first barrier per area, BEFORE body validation: a wrong role gets 403, not 400
                        .requestMatchers("/api/admin/**", "/api/admins/**").hasRole("ADMIN")
                        .requestMatchers("/api/locataire/**").hasRole("LOCATAIRE")
                        .requestMatchers("/api/loyers/**", "/api/dashboard/bailleur").hasRole("BAILLEUR")
                        // le role fin est controle par @PreAuthorize sur chaque endpoint / per-endpoint roles via @PreAuthorize
                        .anyRequest().authenticated())
                .oauth2ResourceServer(o -> o
                        .jwt(j -> j.jwtAuthenticationConverter(converter))
                        .authenticationEntryPoint(entry_point)
                        .accessDeniedHandler(denied_handler))
                .exceptionHandling(e -> e.authenticationEntryPoint(entry_point).accessDeniedHandler(denied_handler));
        return http.build();
    }
}
