package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import customer_complaint.gestion_immobiliere.dto.ArrieresResponse;
import customer_complaint.gestion_immobiliere.dto.LoyerResponse;
import customer_complaint.gestion_immobiliere.dto.QuittanceResponse;
import customer_complaint.gestion_immobiliere.dto.StatutLoyerRequest;
import customer_complaint.gestion_immobiliere.service.ServiceLoyer;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// suivi des loyers du bailleur connecte / rent tracking for the logged-in landlord
@RestController
@RequestMapping("/api/loyers")
@PreAuthorize(Acces.bailleur)
public class ControleurLoyer {

    private final ServiceLoyer service_loyer;

    public ControleurLoyer(ServiceLoyer service_loyer) {
        this.service_loyer = service_loyer;
    }

    @GetMapping
    public List<LoyerResponse> list(@RequestParam(required = false) String period,
                                    @RequestParam(required = false) String status,
                                    @RequestParam(required = false) Long logement_id,
                                    @RequestParam(required = false) Long locataire_id) {
        return service_loyer.list(period, status, logement_id, locataire_id);
    }

    @GetMapping("/arrears")
    public List<ArrieresResponse> arrieres() {
        return service_loyer.arrieres();
    }

    @GetMapping("/{id}")
    public LoyerResponse get(@PathVariable Long id) {
        return service_loyer.get(id);
    }

    @PutMapping("/{id}/status")
    public LoyerResponse changer_statut(@PathVariable Long id, @Valid @RequestBody StatutLoyerRequest request) {
        return service_loyer.changer_statut(id, request);
    }

    @PostMapping("/{id}/reminder")
    public LoyerResponse rappel(@PathVariable Long id) {
        return service_loyer.rappel(id);
    }

    @PostMapping("/{id}/receipt")
    @ResponseStatus(HttpStatus.CREATED)
    public QuittanceResponse creer_quittance(@PathVariable Long id) {
        return service_loyer.creer_quittance(id);
    }
}
