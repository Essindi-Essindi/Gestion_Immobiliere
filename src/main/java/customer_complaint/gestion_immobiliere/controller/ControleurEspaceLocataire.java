package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import customer_complaint.gestion_immobiliere.dto.ContratResponse;
import customer_complaint.gestion_immobiliere.dto.DashboardLocataireResponse;
import customer_complaint.gestion_immobiliere.dto.LocataireResponse;
import customer_complaint.gestion_immobiliere.dto.LogementResponse;
import customer_complaint.gestion_immobiliere.dto.NouveauSignalementRequest;
import customer_complaint.gestion_immobiliere.dto.PaiementsResponse;
import customer_complaint.gestion_immobiliere.dto.ProfilLocataireRequest;
import customer_complaint.gestion_immobiliere.dto.QuittanceLocataireResponse;
import customer_complaint.gestion_immobiliere.dto.SignalementResponse;
import customer_complaint.gestion_immobiliere.service.ServiceEspaceLocataire;
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

// aucun identifiant dans ces URL : le locataire est toujours celui du jeton / no id in these URLs: the tenant is always the token's
@RestController
@RequestMapping("/api/locataire")
@PreAuthorize(Acces.locataire)
public class ControleurEspaceLocataire {

    private final ServiceEspaceLocataire service_espace;

    public ControleurEspaceLocataire(ServiceEspaceLocataire service_espace) {
        this.service_espace = service_espace;
    }

    @GetMapping("/dashboard")
    public DashboardLocataireResponse dashboard() {
        return service_espace.dashboard();
    }

    @GetMapping("/profile")
    public LocataireResponse profil() {
        return service_espace.profil();
    }

    @PutMapping("/profile")
    public LocataireResponse maj_profil(@Valid @RequestBody ProfilLocataireRequest request) {
        return service_espace.maj_profil(request);
    }

    @GetMapping("/logement")
    public LogementResponse logement() {
        return service_espace.logement();
    }

    @GetMapping("/contrat")
    public ContratResponse contrat() {
        return service_espace.contrat();
    }

    // condition necessaire pour que le bailleur puisse resilier ce contrat / required before the landlord can terminate this contract
    @PostMapping("/contrat/resiliation")
    public ContratResponse demander_resiliation() {
        return service_espace.demander_resiliation();
    }

    @GetMapping("/paiements")
    public PaiementsResponse paiements(@RequestParam(required = false) Integer year,
                                       @RequestParam(required = false) String status) {
        return service_espace.paiements(year, status);
    }

    @GetMapping("/quittances")
    public List<QuittanceLocataireResponse> quittances(@RequestParam(required = false) Integer year) {
        return service_espace.quittances(year);
    }

    @GetMapping("/signalements")
    public List<SignalementResponse> signalements(@RequestParam(required = false) String status) {
        return service_espace.signalements(status);
    }

    @GetMapping("/signalements/{id}")
    public SignalementResponse signalement(@PathVariable Long id) {
        return service_espace.signalement(id);
    }

    @PostMapping("/signalements")
    @ResponseStatus(HttpStatus.CREATED)
    public SignalementResponse creer_signalement(@Valid @RequestBody NouveauSignalementRequest request) {
        return service_espace.creer_signalement(request);
    }
}
