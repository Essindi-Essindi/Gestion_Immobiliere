package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.config.Acces;
import org.springframework.security.access.prepost.PreAuthorize;
import customer_complaint.gestion_immobiliere.dto.ReponseSignalementRequest;
import customer_complaint.gestion_immobiliere.dto.SignalementResponse;
import jakarta.validation.Valid;
import customer_complaint.gestion_immobiliere.service.ServiceSignalement;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/signalements")
public class ControleurSignalement {

    private final ServiceSignalement service_signalement;

    public ControleurSignalement(ServiceSignalement service_signalement) {
        this.service_signalement = service_signalement;
    }

    @PreAuthorize(Acces.staff)
    @GetMapping
    public List<SignalementResponse> list(@RequestParam(required = false) String status) {
        return service_signalement.list(status);
    }

    @PreAuthorize(Acces.tous)
    @GetMapping("/{id}")
    public SignalementResponse get(@PathVariable Long id) {
        return service_signalement.get(id);
    }

    @PreAuthorize(Acces.staff)
    @PostMapping("/{id}/processing")
    public SignalementResponse process(@PathVariable Long id,
                                       @Valid @RequestBody(required = false) ReponseSignalementRequest request) {
        return service_signalement.process(id, request == null ? null : request.response());
    }

    @PreAuthorize(Acces.staff)
    @PostMapping("/{id}/closure")
    public SignalementResponse close(@PathVariable Long id,
                                     @Valid @RequestBody(required = false) ReponseSignalementRequest request) {
        return service_signalement.close(id, request == null ? null : request.response());
    }
}
