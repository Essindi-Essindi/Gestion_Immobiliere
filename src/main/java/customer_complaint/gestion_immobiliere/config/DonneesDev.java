package customer_complaint.gestion_immobiliere.config;

import customer_complaint.gestion_immobiliere.model.Admin;
import customer_complaint.gestion_immobiliere.model.Bailleur;
import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Logement;
import customer_complaint.gestion_immobiliere.model.Statuts;
import customer_complaint.gestion_immobiliere.repository.AdminRepository;
import customer_complaint.gestion_immobiliere.repository.BailleurRepository;
import customer_complaint.gestion_immobiliere.repository.ContratRepository;
import customer_complaint.gestion_immobiliere.repository.LocataireRepository;
import customer_complaint.gestion_immobiliere.repository.LogementRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

// jeu de donnees de test, profil dev uniquement / dev-only seed data
@Component
@Order(1)
@Profile("dev")
@Slf4j
public class DonneesDev implements CommandLineRunner {

    private final AdminRepository admin_repository;
    private final BailleurRepository bailleur_repository;
    private final LocataireRepository locataire_repository;
    private final LogementRepository logement_repository;
    private final ContratRepository contrat_repository;
    private final PasswordEncoder password_encoder;
    private final String seed_password;

    public DonneesDev(AdminRepository admin_repository,
                      BailleurRepository bailleur_repository,
                      LocataireRepository locataire_repository,
                      LogementRepository logement_repository,
                      ContratRepository contrat_repository,
                      PasswordEncoder password_encoder,
                      @Value("${app.dev.seed-password}") String seed_password) {
        this.admin_repository = admin_repository;
        this.bailleur_repository = bailleur_repository;
        this.locataire_repository = locataire_repository;
        this.logement_repository = logement_repository;
        this.contrat_repository = contrat_repository;
        this.password_encoder = password_encoder;
        this.seed_password = seed_password;
    }

    @Override
    public void run(String... args) {
        // edge case: deja charge / already seeded
        if (admin_repository.count() > 0) {
            log.info("Donnees dev deja presentes, rien a inserer");
            return;
        }
        String hash = password_encoder.encode(seed_password);

        Admin admin = new Admin();
        admin.setLast_name("Admin");
        admin.setFirst_name("Super");
        admin.setEmail("superadmin@immo.com");
        admin.setPassword(hash);
        admin.setAccess_level("SUPER_ADMIN");
        admin_repository.save(admin);

        Bailleur bailleur = new Bailleur();
        bailleur.setLast_name("Kamga");
        bailleur.setFirst_name("Paul");
        bailleur.setEmail("bailleur@immo.com");
        bailleur.setPassword(hash);
        bailleur.setPhone("0600000001");
        bailleur.setAddress("12 rue des Lilas, Paris");
        bailleur.setAdmin(admin);
        bailleur_repository.save(bailleur);

        Locataire locataire = new Locataire();
        locataire.setLast_name("Ngo");
        locataire.setFirst_name("Marie");
        locataire.setEmail("locataire@immo.com");
        locataire.setPassword(hash);
        locataire.setPhone("0600000002");
        locataire.setBirth_date(LocalDate.of(1998, 5, 14));
        locataire.setAdmin(admin);
        locataire.setBailleur(bailleur);
        locataire_repository.save(locataire);

        Logement logement = new Logement();
        logement.setAddress("5 avenue Victor Hugo, Lyon");
        logement.setType("T2");
        logement.setArea(45.0);
        logement.setRent(650.0);
        logement.setStatus(Statuts.loue);
        logement.setPostal_code("69003");
        logement.setCity("Lyon");
        logement.setCharges(50.0);
        logement.setBailleur(bailleur);
        logement_repository.save(logement);

        // le locataire est rattache au logement avant son contrat / the tenant is attached to the home before the contract
        locataire.setLogement(logement);
        locataire_repository.save(locataire);

        Contrat contrat = new Contrat();
        contrat.setStart_date(LocalDate.now().minusMonths(2));
        contrat.setEnd_date(LocalDate.now().plusMonths(10));
        contrat.setMonthly_rent(650.0);
        contrat.setDeposit(650.0);
        contrat.setLogement(logement);
        contrat.setBailleur(bailleur);
        contrat.setLocataire(locataire);
        contrat_repository.save(contrat);

        log.info("Donnees dev inserees : 1 admin, 1 bailleur, 1 locataire, 1 logement, 1 contrat");
    }
}
