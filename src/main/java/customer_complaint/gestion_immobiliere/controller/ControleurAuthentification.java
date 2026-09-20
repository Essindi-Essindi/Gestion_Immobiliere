package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.model.Compte;
import customer_complaint.gestion_immobiliere.service.ServiceAuthentification;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/authentification")
public class ControleurAuthentification {

    private final ServiceAuthentification service_authentification;

    public ControleurAuthentification(ServiceAuthentification service_authentification) {
        this.service_authentification = service_authentification;
    }

    @PostMapping("/login")
    public Compte log_in(@RequestParam String email, @RequestParam String password) {
        return service_authentification.log_in(email, password);
    }

    @PostMapping("/logout")
    public void log_out() {
        service_authentification.log_out();
    }
}
