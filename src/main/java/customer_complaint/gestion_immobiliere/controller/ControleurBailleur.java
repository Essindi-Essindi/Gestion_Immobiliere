package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.model.Bailleur;
import customer_complaint.gestion_immobiliere.model.Quittance;
import customer_complaint.gestion_immobiliere.service.ServiceBailleur;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bailleurs")
public class ControleurBailleur {

    private final ServiceBailleur service_bailleur;

    public ControleurBailleur(ServiceBailleur service_bailleur) {
        this.service_bailleur = service_bailleur;
    }

    @PostMapping
    public Bailleur create(@RequestBody Bailleur bailleur) {
        return service_bailleur.create(bailleur);
    }

    @GetMapping
    public List<Bailleur> list() {
        return service_bailleur.list();
    }

    @GetMapping("/{id}")
    public Bailleur get(@PathVariable Long id) {
        return service_bailleur.get(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service_bailleur.delete(id);
    }

    @PostMapping("/properties")
    public void manage_properties() {
        service_bailleur.manage_properties();
    }

    @PostMapping("/contrats/{contrat_id}/receipts")
    public Quittance generate_receipt(@PathVariable Long contrat_id) {
        return service_bailleur.generate_receipt(contrat_id);
    }
}
