package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import customer_complaint.gestion_immobiliere.dto.DocumentResponse;
import customer_complaint.gestion_immobiliere.dto.QuittanceRequest;
import customer_complaint.gestion_immobiliere.dto.QuittanceResponse;
import customer_complaint.gestion_immobiliere.service.ServiceQuittance;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quittances")
public class ControleurQuittance {

    private final ServiceQuittance service_quittance;

    public ControleurQuittance(ServiceQuittance service_quittance) {
        this.service_quittance = service_quittance;
    }

    @PreAuthorize(Acces.bailleur)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuittanceResponse create(@Valid @RequestBody QuittanceRequest request) {
        return service_quittance.create(request);
    }

    @PreAuthorize(Acces.staff)
    @GetMapping
    public List<QuittanceResponse> list() {
        return service_quittance.list();
    }

    @PreAuthorize(Acces.tous)
    @GetMapping("/{id}")
    public QuittanceResponse get(@PathVariable Long id) {
        return service_quittance.get(id);
    }

    // telechargement du PDF : bailleur et locataire du contrat seulement / PDF download: the contract's landlord and tenant only
    @PreAuthorize(Acces.bailleur_ou_locataire)
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> generate_pdf(@PathVariable Long id) {
        return Telechargement.pdf(service_quittance.generate_pdf(id));
    }

    @PreAuthorize(Acces.bailleur)
    @GetMapping("/{id}/document")
    public DocumentResponse document(@PathVariable Long id) {
        return service_quittance.document(id);
    }

    @PreAuthorize(Acces.bailleur)
    @PostMapping("/{id}/sending")
    public DocumentResponse send(@PathVariable Long id) {
        return service_quittance.send(id);
    }
}
