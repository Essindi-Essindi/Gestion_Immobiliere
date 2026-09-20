package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.model.Quittance;
import customer_complaint.gestion_immobiliere.service.ServiceQuittance;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quittances")
public class ControleurQuittance {

    private final ServiceQuittance service_quittance;

    public ControleurQuittance(ServiceQuittance service_quittance) {
        this.service_quittance = service_quittance;
    }

    @GetMapping
    public List<Quittance> list() {
        return service_quittance.list();
    }

    @GetMapping("/{id}")
    public Quittance get(@PathVariable Long id) {
        return service_quittance.get(id);
    }

    @GetMapping("/{id}/pdf")
    public byte[] generate_pdf(@PathVariable Long id) {
        return service_quittance.generate_pdf(id);
    }

    @PostMapping("/{id}/sending")
    public void send(@PathVariable Long id) {
        service_quittance.send(id);
    }
}
