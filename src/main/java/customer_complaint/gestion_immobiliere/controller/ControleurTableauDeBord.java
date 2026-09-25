package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import customer_complaint.gestion_immobiliere.dto.DashboardResponse;
import customer_complaint.gestion_immobiliere.service.ServiceTableauDeBord;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class ControleurTableauDeBord {

    private final ServiceTableauDeBord service_tableau_de_bord;

    public ControleurTableauDeBord(ServiceTableauDeBord service_tableau_de_bord) {
        this.service_tableau_de_bord = service_tableau_de_bord;
    }

    @PreAuthorize(Acces.bailleur)
    @GetMapping("/bailleur")
    public DashboardResponse bailleur() {
        return service_tableau_de_bord.bailleur();
    }
}
