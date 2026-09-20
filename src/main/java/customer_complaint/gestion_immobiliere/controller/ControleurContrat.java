package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.service.ServiceContrat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/contrats")
public class ControleurContrat {

    private final ServiceContrat service_contrat;

    public ControleurContrat(ServiceContrat service_contrat) {
        this.service_contrat = service_contrat;
    }

    @PostMapping
    public Contrat create(@RequestBody Contrat contrat) {
        return service_contrat.create(contrat);
    }

    @GetMapping
    public List<Contrat> list() {
        return service_contrat.list();
    }

    @GetMapping("/{id}")
    public Contrat get(@PathVariable Long id) {
        return service_contrat.get(id);
    }

    @PostMapping("/{id}/termination")
    public void terminate(@PathVariable Long id) {
        service_contrat.terminate(id);
    }

    @GetMapping("/{id}/pdf")
    public byte[] generate_pdf(@PathVariable Long id) {
        return service_contrat.generate_pdf(id);
    }
}
