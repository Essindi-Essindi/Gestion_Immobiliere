package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Signalement;
import customer_complaint.gestion_immobiliere.service.ServiceLocataire;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locataires")
public class ControleurLocataire {

    private final ServiceLocataire service_locataire;

    public ControleurLocataire(ServiceLocataire service_locataire) {
        this.service_locataire = service_locataire;
    }

    @PostMapping
    public Locataire create(@RequestBody Locataire locataire) {
        return service_locataire.create(locataire);
    }

    @GetMapping
    public List<Locataire> list() {
        return service_locataire.list();
    }

    @GetMapping("/{id}")
    public Locataire get(@PathVariable Long id) {
        return service_locataire.get(id);
    }

    @PutMapping("/{id}")
    public Locataire update(@PathVariable Long id, @RequestBody Locataire locataire) {
        return service_locataire.update(id, locataire);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service_locataire.delete(id);
    }

    @PostMapping("/{id}/reports")
    public Signalement report_issue(@RequestBody Signalement signalement) {
        return service_locataire.report_issue(signalement);
    }

    @GetMapping("/{id}/contract")
    public Contrat view_contract(@PathVariable Long id) {
        return service_locataire.view_contract(id);
    }
}
