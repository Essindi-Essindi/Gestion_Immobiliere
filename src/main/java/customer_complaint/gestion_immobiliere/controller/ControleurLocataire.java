package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import org.springframework.security.access.prepost.PreAuthorize;
import customer_complaint.gestion_immobiliere.dto.ContratResponse;
import customer_complaint.gestion_immobiliere.dto.LocataireRequest;
import customer_complaint.gestion_immobiliere.dto.LocataireResponse;
import customer_complaint.gestion_immobiliere.dto.SignalementRequest;
import customer_complaint.gestion_immobiliere.dto.SignalementResponse;
import customer_complaint.gestion_immobiliere.service.ServiceLocataire;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locataires")
public class ControleurLocataire {

    private final ServiceLocataire service_locataire;

    public ControleurLocataire(ServiceLocataire service_locataire) {
        this.service_locataire = service_locataire;
    }

    @PreAuthorize(Acces.staff)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LocataireResponse create(@Valid @RequestBody LocataireRequest request) {
        return service_locataire.create(request);
    }

    @PreAuthorize(Acces.staff)
    @GetMapping
    public List<LocataireResponse> list(@RequestParam(required = false) Long logement_id) {
        return service_locataire.list(logement_id);
    }

    @PreAuthorize(Acces.staff_ou_locataire_soi)
    @GetMapping("/{id}")
    public LocataireResponse get(@PathVariable Long id) {
        return service_locataire.get(id);
    }

    @PreAuthorize(Acces.staff)
    @PutMapping("/{id}")
    public LocataireResponse update(@PathVariable Long id, @Valid @RequestBody LocataireRequest request) {
        return service_locataire.update(id, request);
    }

    @PreAuthorize(Acces.staff)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service_locataire.delete(id);
    }

    @PreAuthorize(Acces.locataire_soi)
    @PostMapping("/{id}/reports")
    @ResponseStatus(HttpStatus.CREATED)
    public SignalementResponse report_issue(@PathVariable Long id, @Valid @RequestBody SignalementRequest request) {
        return service_locataire.report_issue(id, request);
    }

    @PreAuthorize(Acces.staff_ou_locataire_soi)
    @GetMapping("/{id}/contract")
    public ContratResponse view_contract(@PathVariable Long id) {
        return service_locataire.view_contract(id);
    }
}
