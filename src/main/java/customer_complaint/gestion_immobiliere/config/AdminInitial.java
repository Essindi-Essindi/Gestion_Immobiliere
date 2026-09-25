package customer_complaint.gestion_immobiliere.config;

import customer_complaint.gestion_immobiliere.model.Admin;
import customer_complaint.gestion_immobiliere.repository.AdminRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// premier admin via ADMIN_EMAIL / ADMIN_PASSWORD, sinon personne ne pourrait creer de comptes
// first admin from env vars, otherwise nobody could create accounts
@Component
@Order(2)
@Slf4j
public class AdminInitial implements CommandLineRunner {

    private final AdminRepository admin_repository;
    private final PasswordEncoder password_encoder;
    private final String email;
    private final String password;

    public AdminInitial(AdminRepository admin_repository, PasswordEncoder password_encoder,
                        @Value("${app.bootstrap.admin-email:}") String email,
                        @Value("${app.bootstrap.admin-password:}") String password) {
        this.admin_repository = admin_repository;
        this.password_encoder = password_encoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (email.isBlank() || password.isBlank() || admin_repository.count() > 0) {
            return;
        }
        if (password.length() < 8) {
            log.warn("ADMIN_PASSWORD trop court (8 caractères minimum) : admin initial non créé");
            return;
        }
        Admin admin = new Admin();
        admin.setLast_name("Admin");
        admin.setFirst_name("Super");
        admin.setEmail(email.trim().toLowerCase());
        admin.setPassword(password_encoder.encode(password));
        admin.setAccess_level("SUPER_ADMIN");
        admin_repository.save(admin);
        log.info("Admin initial créé : {}", admin.getEmail());
    }
}
