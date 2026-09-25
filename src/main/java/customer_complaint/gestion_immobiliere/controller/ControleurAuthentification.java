package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import customer_complaint.gestion_immobiliere.dto.ChangePasswordRequest;
import customer_complaint.gestion_immobiliere.dto.ForgotPasswordRequest;
import customer_complaint.gestion_immobiliere.dto.LoginRequest;
import customer_complaint.gestion_immobiliere.dto.ResetPasswordRequest;
import customer_complaint.gestion_immobiliere.service.ServiceMotDePasse;
import customer_complaint.gestion_immobiliere.dto.LoginResponse;
import customer_complaint.gestion_immobiliere.dto.RefreshRequest;
import customer_complaint.gestion_immobiliere.service.ServiceAuthentification;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// endpoints publics (voir ConfigSecurite) / public endpoints (see ConfigSecurite)
@RestController
@RequestMapping("/api/authentification")
public class ControleurAuthentification {

    private final ServiceAuthentification service_authentification;
    private final ServiceMotDePasse service_mot_de_passe;

    public ControleurAuthentification(ServiceAuthentification service_authentification,
                                      ServiceMotDePasse service_mot_de_passe) {
        this.service_authentification = service_authentification;
        this.service_mot_de_passe = service_mot_de_passe;
    }

    @PostMapping("/login")
    public LoginResponse log_in(@Valid @RequestBody LoginRequest request) {
        return service_authentification.log_in(request);
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return service_authentification.refresh(request);
    }

    // 202 toujours, que le compte existe ou non / always 202, whether or not the account exists
    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void forgot_password(@Valid @RequestBody ForgotPasswordRequest request) {
        service_mot_de_passe.demander(request.email());
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reset_password(@Valid @RequestBody ResetPasswordRequest request) {
        service_mot_de_passe.reinitialiser(request.token(), request.new_password());
    }

    // tout compte connecte ; sert aussi a la premiere connexion d un locataire / any logged-in account; also first login of a tenant
    @PreAuthorize(Acces.tous)
    @PostMapping("/change-password")
    public LoginResponse change_password(@Valid @RequestBody ChangePasswordRequest request) {
        return service_authentification.change_password(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void log_out(@Valid @RequestBody RefreshRequest request) {
        service_authentification.log_out(request);
    }
}
