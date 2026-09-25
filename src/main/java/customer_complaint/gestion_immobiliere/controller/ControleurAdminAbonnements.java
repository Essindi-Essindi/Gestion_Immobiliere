package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import customer_complaint.gestion_immobiliere.dto.AbonnementRequest;
import customer_complaint.gestion_immobiliere.dto.AbonnementResponse;
import customer_complaint.gestion_immobiliere.dto.ChangementPlanRequest;
import customer_complaint.gestion_immobiliere.dto.FactureResponse;
import customer_complaint.gestion_immobiliere.dto.PlanRequest;
import customer_complaint.gestion_immobiliere.dto.PlanResponse;
import customer_complaint.gestion_immobiliere.dto.SimulationFacturationResponse;
import customer_complaint.gestion_immobiliere.dto.StatutFactureRequest;
import customer_complaint.gestion_immobiliere.service.ServiceAbonnement;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

// plans, abonnements et facturation simulee / plans, subscriptions and simulated billing
@RestController
@RequestMapping("/api/admin")
@PreAuthorize(Acces.admin)
public class ControleurAdminAbonnements {

    private final ServiceAbonnement service;

    public ControleurAdminAbonnements(ServiceAbonnement service) {
        this.service = service;
    }

    // ---- plans

    @GetMapping("/plans")
    public List<PlanResponse> plans() {
        return service.plans();
    }

    @PostMapping("/plans")
    @ResponseStatus(HttpStatus.CREATED)
    public PlanResponse creer_plan(@Valid @RequestBody PlanRequest request) {
        return service.creer_plan(request);
    }

    @PutMapping("/plans/{id}")
    public PlanResponse modifier_plan(@PathVariable Long id, @Valid @RequestBody PlanRequest request) {
        return service.modifier_plan(id, request);
    }

    @PostMapping("/plans/{id}/suspension")
    public PlanResponse suspendre_plan(@PathVariable Long id) {
        return service.suspendre_plan(id);
    }

    @PostMapping("/plans/{id}/activation")
    public PlanResponse activer_plan(@PathVariable Long id) {
        return service.activer_plan(id);
    }

    @DeleteMapping("/plans/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void supprimer_plan(@PathVariable Long id) {
        service.supprimer_plan(id);
    }

    // ---- abonnements

    @GetMapping("/abonnements")
    public List<AbonnementResponse> abonnements(@RequestParam(required = false) String status,
                                                @RequestParam(required = false) Long plan_id) {
        return service.abonnements(status, plan_id);
    }

    @PostMapping("/abonnements")
    @ResponseStatus(HttpStatus.CREATED)
    public AbonnementResponse souscrire(@Valid @RequestBody AbonnementRequest request) {
        return service.souscrire(request);
    }

    @PutMapping("/abonnements/{id}/plan")
    public AbonnementResponse changer_plan(@PathVariable Long id, @Valid @RequestBody ChangementPlanRequest request) {
        return service.changer_plan(id, request.plan_id());
    }

    @PostMapping("/abonnements/{id}/suspension")
    public AbonnementResponse suspendre_abonnement(@PathVariable Long id) {
        return service.suspendre_abonnement(id);
    }

    @PostMapping("/abonnements/{id}/resumption")
    public AbonnementResponse reprendre_abonnement(@PathVariable Long id) {
        return service.reprendre_abonnement(id);
    }

    @PostMapping("/abonnements/{id}/termination")
    public AbonnementResponse resilier(@PathVariable Long id) {
        return service.resilier(id);
    }

    // ---- facturation simulee

    @GetMapping("/factures")
    public List<FactureResponse> factures(@RequestParam(required = false) Long bailleur_id,
                                          @RequestParam(required = false) String status) {
        return service.factures(bailleur_id, status);
    }

    @PutMapping("/factures/{id}/status")
    public FactureResponse changer_statut_facture(@PathVariable Long id,
                                                  @Valid @RequestBody StatutFactureRequest request) {
        return service.changer_statut_facture(id, request.status());
    }

    @PostMapping("/facturation/simulation")
    public SimulationFacturationResponse simuler(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.simuler(date);
    }
}
