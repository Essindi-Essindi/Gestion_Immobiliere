package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import org.springframework.security.access.prepost.PreAuthorize;
import customer_complaint.gestion_immobiliere.dto.AssignationRequest;
import customer_complaint.gestion_immobiliere.dto.LogementRequest;
import customer_complaint.gestion_immobiliere.dto.LogementResponse;
import customer_complaint.gestion_immobiliere.service.ServiceLogement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/logements")
public class ControleurLogement {

    private final ServiceLogement service_logement;

    public ControleurLogement(ServiceLogement service_logement) {
        this.service_logement = service_logement;
    }

    @PreAuthorize(Acces.bailleur)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LogementResponse create(@Valid @RequestBody LogementRequest request) {
        return service_logement.create(request);
    }

    @PreAuthorize(Acces.staff)
    @GetMapping
    public List<LogementResponse> list() {
        return service_logement.list();
    }

    @PreAuthorize(Acces.tous)
    @GetMapping("/{id}")
    public LogementResponse get(@PathVariable Long id) {
        return service_logement.get(id);
    }

    @PreAuthorize(Acces.bailleur)
    @PutMapping("/{id}")
    public LogementResponse update(@PathVariable Long id, @Valid @RequestBody LogementRequest request) {
        return service_logement.update(id, request);
    }

    @PreAuthorize(Acces.bailleur)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service_logement.delete(id);
    }

    @PreAuthorize(Acces.bailleur)
    @PostMapping("/{id}/assignations")
    public LogementResponse assigner(@PathVariable Long id, @Valid @RequestBody AssignationRequest request) {
        return service_logement.assigner(id, request.locataire_id(), request.piece_id());
    }

    @PreAuthorize(Acces.bailleur)
    @DeleteMapping("/{id}/occupants/{locataire_id}")
    public LogementResponse liberer(@PathVariable Long id, @PathVariable Long locataire_id) {
        return service_logement.liberer(id, locataire_id);
    }
}
