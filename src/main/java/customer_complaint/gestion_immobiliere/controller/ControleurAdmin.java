package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import org.springframework.security.access.prepost.PreAuthorize;
import customer_complaint.gestion_immobiliere.dto.AdminRequest;
import customer_complaint.gestion_immobiliere.dto.AdminResponse;
import customer_complaint.gestion_immobiliere.service.ServiceAdmin;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@PreAuthorize(Acces.admin)
@RestController
@RequestMapping("/api/admins")
public class ControleurAdmin {

    private final ServiceAdmin service_admin;

    public ControleurAdmin(ServiceAdmin service_admin) {
        this.service_admin = service_admin;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminResponse create(@Valid @RequestBody AdminRequest request) {
        return service_admin.create(request);
    }

    @GetMapping
    public List<AdminResponse> list() {
        return service_admin.list();
    }

    @GetMapping("/{id}")
    public AdminResponse get(@PathVariable Long id) {
        return service_admin.get(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service_admin.delete(id);
    }

    @PostMapping("/accounts")
    public void manage_accounts() {
        service_admin.manage_accounts();
    }

    @GetMapping("/activity")
    public void view_activity() {
        service_admin.view_activity();
    }

    @PostMapping("/roles")
    public void manage_roles() {
        service_admin.manage_roles();
    }
}
