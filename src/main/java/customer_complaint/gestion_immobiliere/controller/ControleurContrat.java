package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import customer_complaint.gestion_immobiliere.dto.ContratRequest;
import customer_complaint.gestion_immobiliere.dto.ContratResponse;
import customer_complaint.gestion_immobiliere.dto.DocumentResponse;
import customer_complaint.gestion_immobiliere.service.ServiceContrat;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/contrats")
public class ControleurContrat {

    private final ServiceContrat service_contrat;

    public ControleurContrat(ServiceContrat service_contrat) {
        this.service_contrat = service_contrat;
    }

    @PreAuthorize(Acces.bailleur)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContratResponse create(@Valid @RequestBody ContratRequest request) {
        return service_contrat.create(request);
    }

    @PreAuthorize(Acces.staff)
    @GetMapping
    public List<ContratResponse> list(@RequestParam(required = false) Boolean actif) {
        return service_contrat.list(actif);
    }

    @PreAuthorize(Acces.tous)
    @GetMapping("/{id}")
    public ContratResponse get(@PathVariable Long id) {
        return service_contrat.get(id);
    }

    @PreAuthorize(Acces.bailleur)
    @PostMapping("/{id}/termination")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void terminate(@PathVariable Long id) {
        service_contrat.terminate(id);
    }

    // telechargement du PDF : bailleur et locataire du contrat seulement / PDF download: the contract's landlord and tenant only
    @PreAuthorize(Acces.bailleur_ou_locataire)
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> generate_pdf(@PathVariable Long id) {
        return Telechargement.pdf(service_contrat.generate_pdf(id));
    }

    // etat de l'envoi par e-mail (echec, partiel...) / e-mail delivery state (failure, partial...)
    @PreAuthorize(Acces.bailleur)
    @GetMapping("/{id}/document")
    public DocumentResponse document(@PathVariable Long id) {
        return service_contrat.document(id);
    }

    // relance l'envoi a ceux qui n'ont rien recu / retries for those who received nothing
    @PreAuthorize(Acces.bailleur)
    @PostMapping("/{id}/sending")
    public DocumentResponse send(@PathVariable Long id) {
        return service_contrat.send(id);
    }
}
