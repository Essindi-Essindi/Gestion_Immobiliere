package customer_complaint.gestion_immobiliere.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// API HTTP (port 443) : le plan gratuit de Render bloque les ports SMTP 25, 465 et 587
// HTTP API (port 443): Render's free plan blocks SMTP ports 25, 465 and 587
@Component
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "brevo")
public class ExpediteurBrevo implements ExpediteurMail {

    private static final URI endpoint = URI.create("https://api.brevo.com/v3/smtp/email");

    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper mapper;
    private final String api_key;
    private final String from;
    private final String from_name;

    public ExpediteurBrevo(ObjectMapper mapper,
                           @Value("${app.mail.brevo.api-key:}") String api_key,
                           @Value("${app.mail.from:no-reply@gestion-immobiliere.local}") String from,
                           @Value("${app.mail.from-name:Gestion Immobilière}") String from_name) {
        this.mapper = mapper;
        this.api_key = api_key.trim();
        this.from = from;
        this.from_name = from_name;
    }

    @Override
    public boolean disponible() {
        return !api_key.isEmpty();
    }

    @Override
    public void envoyer(String destinataire, String sujet, String texte, String html, String nom_piece, byte[] piece)
            throws Exception {
        if (!disponible()) {
            throw new IllegalStateException("Brevo non configuré (BREVO_API_KEY)");
        }
        Map<String, Object> corps = new LinkedHashMap<>();
        // l'expediteur doit etre valide dans Brevo (Senders) / the sender must be validated in Brevo
        corps.put("sender", Map.of("name", from_name, "email", from));
        corps.put("replyTo", Map.of("email", from));
        corps.put("to", List.of(Map.of("email", destinataire)));
        corps.put("subject", sujet);
        corps.put("textContent", texte);
        if (html != null) {
            corps.put("htmlContent", html);
        }
        if (piece != null) {
            corps.put("attachment", List.of(Map.of("name", nom_piece,
                    "content", Base64.getEncoder().encodeToString(piece))));
        }
        HttpRequest requete = HttpRequest.newBuilder(endpoint)
                .timeout(Duration.ofSeconds(30))
                .header("api-key", api_key)
                .header("content-type", "application/json")
                .header("accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(corps)))
                .build();
        HttpResponse<String> reponse = client.send(requete, HttpResponse.BodyHandlers.ofString());
        if (reponse.statusCode() / 100 != 2) {
            throw new IllegalStateException("Brevo a répondu " + reponse.statusCode() + " : " + reponse.body());
        }
    }
}
