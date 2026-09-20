package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.model.Signalement;
import customer_complaint.gestion_immobiliere.service.ServiceSignalement;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/signalements")
public class ControleurSignalement {

    private final ServiceSignalement service_signalement;

    public ControleurSignalement(ServiceSignalement service_signalement) {
        this.service_signalement = service_signalement;
    }

    @GetMapping
    public List<Signalement> list() {
        return service_signalement.list();
    }

    @GetMapping("/{id}")
    public Signalement get(@PathVariable Long id) {
        return service_signalement.get(id);
    }

    @PostMapping("/{id}/processing")
    public void process(@PathVariable Long id) {
        service_signalement.process(id);
    }

    @PostMapping("/{id}/closure")
    public void close(@PathVariable Long id) {
        service_signalement.close(id);
    }
}
