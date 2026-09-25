package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.AdminRequest;
import customer_complaint.gestion_immobiliere.dto.AdminResponse;
import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Admin;
import customer_complaint.gestion_immobiliere.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceAdminImpl implements ServiceAdmin {

    private final ServiceAudit service_audit;
    private final AdminRepository admin_repository;
    private final VerificationEmail verification_email;
    private final PasswordEncoder password_encoder;

    @Override
    public AdminResponse create(AdminRequest request) {
        if (request.password() == null) {
            throw new RequeteInvalide("Le mot de passe est obligatoire");
        }
        String email = verification_email.normaliser(request.email());
        verification_email.assurer_libre(email);

        Admin admin = new Admin();
        admin.setLast_name(request.last_name());
        admin.setFirst_name(request.first_name());
        admin.setEmail(email);
        admin.setPassword(password_encoder.encode(request.password()));
        admin.setAccess_level(request.access_level());
        Admin cree = admin_repository.save(admin);
        service_audit.creation("ADMIN", cree.getId(), "Administrateur " + cree.getFirst_name() + " " + cree.getLast_name());
        return AdminResponse.from(cree);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminResponse> list() {
        return admin_repository.findAll().stream().map(AdminResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminResponse get(Long id) {
        return AdminResponse.from(trouver(id));
    }

    @Override
    public void delete(Long id) {
        Admin admin = trouver(id);
        // edge case: comptes encore rattaches / accounts still attached
        if (!admin.getBailleurs().isEmpty() || !admin.getLocataires().isEmpty()) {
            throw new ConflitDonnees("Impossible de supprimer un administrateur qui supervise encore des comptes");
        }
        admin_repository.delete(admin);
        service_audit.suppression("ADMIN", id, "Administrateur " + admin.getFirst_name() + " " + admin.getLast_name());
    }

    @Override
    public void manage_accounts() {
    }

    @Override
    public void view_activity() {
    }

    @Override
    public void manage_roles() {
    }

    private Admin trouver(Long id) {
        return admin_repository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvable("Administrateur introuvable : " + id));
    }
}
