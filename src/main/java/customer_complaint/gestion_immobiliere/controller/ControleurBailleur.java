package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import org.springframework.security.access.prepost.PreAuthorize;
import customer_complaint.gestion_immobiliere.dto.BailleurRequest;
import customer_complaint.gestion_immobiliere.dto.BailleurResponse;
import customer_complaint.gestion_immobiliere.dto.QuittanceResponse;
import customer_complaint.gestion_immobiliere.service.ServiceBailleur;
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

@RestController
@RequestMapping("/api/bailleurs")
public class ControleurBailleur {

    private final ServiceBailleur service_bailleur;

    public ControleurBailleur(ServiceBailleur service_bailleur) {
        this.service_bailleur = service_bailleur;
    }

    @PreAuthorize(Acces.admin)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BailleurResponse create(@Valid @RequestBody BailleurRequest request) {
        return service_bailleur.create(request);
    }

    @PreAuthorize(Acces.admin)
    @GetMapping
    public List<BailleurResponse> list() {
        return service_bailleur.list();
    }

    @PreAuthorize(Acces.admin_ou_bailleur_soi)
    @GetMapping("/{id}")
    public BailleurResponse get(@PathVariable Long id) {
        return service_bailleur.get(id);
    }

    @PreAuthorize(Acces.admin)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service_bailleur.delete(id);
    }

    @PreAuthorize(Acces.bailleur)
    @PostMapping("/properties")
    public void manage_properties() {
        service_bailleur.manage_properties();
    }

    @PreAuthorize(Acces.bailleur)
    @PostMapping("/contrats/{contrat_id}/receipts")
    @ResponseStatus(HttpStatus.CREATED)
    public QuittanceResponse generate_receipt(@PathVariable Long contrat_id) {
        return service_bailleur.generate_receipt(contrat_id);
    }
}
