package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import customer_complaint.gestion_immobiliere.dto.AdminBailleurResponse;
import customer_complaint.gestion_immobiliere.dto.AdminLocataireResponse;
import customer_complaint.gestion_immobiliere.dto.SuspensionRequest;
import customer_complaint.gestion_immobiliere.service.ServiceAdminUtilisateurs;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// espace super-admin : comptes / super-admin space: accounts
@RestController
@RequestMapping("/api/admin")
@PreAuthorize(Acces.admin)
public class ControleurAdminUtilisateurs {

    private final ServiceAdminUtilisateurs service;

    public ControleurAdminUtilisateurs(ServiceAdminUtilisateurs service) {
        this.service = service;
    }

    @GetMapping("/bailleurs")
    public List<AdminBailleurResponse> bailleurs(@RequestParam(required = false) String status,
                                                 @RequestParam(required = false) String q) {
        return service.bailleurs(status, q);
    }

    @GetMapping("/bailleurs/{id}")
    public AdminBailleurResponse bailleur(@PathVariable Long id) {
        return service.bailleur(id);
    }

    @PostMapping("/bailleurs/{id}/suspension")
    public AdminBailleurResponse suspendre_bailleur(@PathVariable Long id,
                                                    @Valid @RequestBody(required = false) SuspensionRequest request) {
        return service.suspendre_bailleur(id, request == null ? null : request.reason());
    }

    @PostMapping("/bailleurs/{id}/activation")
    public AdminBailleurResponse activer_bailleur(@PathVariable Long id) {
        return service.activer_bailleur(id);
    }

    @GetMapping("/locataires")
    public List<AdminLocataireResponse> locataires(@RequestParam(required = false) String status,
                                                   @RequestParam(required = false) String q) {
        return service.locataires(status, q);
    }

    @GetMapping("/locataires/{id}")
    public AdminLocataireResponse locataire(@PathVariable Long id) {
        return service.locataire(id);
    }

    @PostMapping("/locataires/{id}/suspension")
    public AdminLocataireResponse suspendre_locataire(@PathVariable Long id,
                                                      @Valid @RequestBody(required = false) SuspensionRequest request) {
        return service.suspendre_locataire(id, request == null ? null : request.reason());
    }

    @PostMapping("/locataires/{id}/activation")
    public AdminLocataireResponse activer_locataire(@PathVariable Long id) {
        return service.activer_locataire(id);
    }
}
