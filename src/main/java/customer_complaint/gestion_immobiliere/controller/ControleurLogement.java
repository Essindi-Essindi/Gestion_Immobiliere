package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.model.Logement;
import customer_complaint.gestion_immobiliere.service.ServiceLogement;
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
@RequestMapping("/api/logements")
public class ControleurLogement {

    private final ServiceLogement service_logement;

    public ControleurLogement(ServiceLogement service_logement) {
        this.service_logement = service_logement;
    }

    @PostMapping
    public Logement create(@RequestBody Logement logement) {
        return service_logement.create(logement);
    }

    @GetMapping
    public List<Logement> list() {
        return service_logement.list();
    }

    @GetMapping("/{id}")
    public Logement get(@PathVariable Long id) {
        return service_logement.get(id);
    }

    @PutMapping("/{id}")
    public Logement update(@PathVariable Long id, @RequestBody Logement logement) {
        return service_logement.update(id, logement);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service_logement.delete(id);
    }
}
