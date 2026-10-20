package customer_complaint.gestion_immobiliere.config;

import customer_complaint.gestion_immobiliere.repository.AdminRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;

// charge sql/seed-test-data.sql une seule fois, au premier demarrage sur une base vide (ex. Aiven)
// loads sql/seed-test-data.sql once, on the first start with an empty database (e.g. Aiven)
@Component
@Order(1)
@Slf4j
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DonneesInitiales implements CommandLineRunner {

    private final AdminRepository admin_repository;
    private final DataSource data_source;
    private final Resource script;

    public DonneesInitiales(AdminRepository admin_repository, DataSource data_source,
                            @Value("classpath:seed/seed-test-data.sql") Resource script) {
        this.admin_repository = admin_repository;
        this.data_source = data_source;
        this.script = script;
    }

    @Override
    public void run(String... args) {
        // edge case: base deja remplie, on ne touche a rien / already filled, leave it alone
        if (admin_repository.count() > 0) {
            log.info("Base déjà initialisée : jeu de données non rechargé");
            return;
        }
        // une seule connexion pour tout le script : les variables @admin1_id... doivent survivre d'une ligne a l'autre
        // one connection for the whole script: the @admin1_id... variables must survive between statements
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator(script);
        populator.setSqlScriptEncoding(StandardCharsets.UTF_8.name());
        populator.execute(data_source);
        log.info("Jeu de données initial chargé depuis seed-test-data.sql ({} admin(s))", admin_repository.count());
    }
}
