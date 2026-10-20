package customer_complaint.gestion_immobiliere.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Map;

// point de controle public pour UptimeRobot : garde l'API et la base eveillees sur le plan gratuit de Render
// public check for UptimeRobot: keeps the API and the database awake on Render's free plan
@RestController
public class ControleurSante {

    private final DataSource data_source;

    public ControleurSante(DataSource data_source) {
        this.data_source = data_source;
    }

    // GET et HEAD : certains moniteurs n'envoient que HEAD / some monitors only send HEAD
    @RequestMapping(value = "/api/health", method = {RequestMethod.GET, RequestMethod.HEAD})
    public ResponseEntity<Map<String, String>> health() {
        boolean base_ok;
        try (Connection connexion = data_source.getConnection()) {
            base_ok = connexion.isValid(3);
        } catch (Exception e) {
            base_ok = false;
        }
        // edge case: base arretee = 503, le moniteur signale la panne / database down = 503, the monitor reports it
        HttpStatus status = base_ok ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return ResponseEntity.status(status).body(Map.of("status", base_ok ? "UP" : "DOWN",
                "database", base_ok ? "UP" : "DOWN"));
    }
}
