package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import customer_complaint.gestion_immobiliere.dto.AdminDashboardResponse;
import customer_complaint.gestion_immobiliere.dto.JournalResponse;
import customer_complaint.gestion_immobiliere.dto.PageResponse;
import customer_complaint.gestion_immobiliere.dto.ParametresRequest;
import customer_complaint.gestion_immobiliere.dto.ParametresResponse;
import customer_complaint.gestion_immobiliere.service.ServiceAdminTableauDeBord;
import customer_complaint.gestion_immobiliere.service.ServiceAudit;
import customer_complaint.gestion_immobiliere.service.ServiceParametres;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

// tableau de bord, parametres de la plateforme, journal d'audit (lecture seule)
// dashboard, platform settings, audit log (read-only)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize(Acces.admin)
public class ControleurAdminPlateforme {

    private final ServiceAdminTableauDeBord service_tableau;
    private final ServiceParametres service_parametres;
    private final ServiceAudit service_audit;

    public ControleurAdminPlateforme(ServiceAdminTableauDeBord service_tableau, ServiceParametres service_parametres,
                                     ServiceAudit service_audit) {
        this.service_tableau = service_tableau;
        this.service_parametres = service_parametres;
        this.service_audit = service_audit;
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse dashboard() {
        return service_tableau.tableau();
    }

    @GetMapping("/parametres")
    public ParametresResponse parametres() {
        return service_parametres.lire();
    }

    @PutMapping("/parametres")
    public ParametresResponse maj_parametres(@Valid @RequestBody ParametresRequest request) {
        return service_parametres.mettre_a_jour(request);
    }

    @PostMapping("/parametres/reset")
    public ParametresResponse reinitialiser_parametres() {
        return service_parametres.reinitialiser();
    }

    // aucune route d'ecriture ni de suppression : le journal ne se modifie pas / no write or delete route: the log is immutable
    @GetMapping("/journal")
    public PageResponse<JournalResponse> journal(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service_audit.rechercher(type, q, from, to, page, size);
    }
}
