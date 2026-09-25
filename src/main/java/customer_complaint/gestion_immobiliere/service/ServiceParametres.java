package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.ParametresRequest;
import customer_complaint.gestion_immobiliere.dto.ParametresResponse;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.model.JournalAudit;
import customer_complaint.gestion_immobiliere.model.ParametrePlateforme;
import customer_complaint.gestion_immobiliere.repository.ParametrePlateformeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Currency;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceParametres {

    private final ParametrePlateformeRepository parametre_repository;
    private final ServiceAudit service_audit;

    // la ligne unique est creee au premier acces / the single row is created on first access
    public ParametrePlateforme courant() {
        return parametre_repository.findById(ParametrePlateforme.id_unique)
                .orElseGet(() -> parametre_repository.save(new ParametrePlateforme()));
    }

    public boolean maintenance() {
        return courant().isMaintenance_mode();
    }

    public boolean notifications_email() {
        return courant().isEmail_notifications();
    }

    public ParametresResponse lire() {
        return ParametresResponse.from(courant());
    }

    public ParametresResponse mettre_a_jour(ParametresRequest request) {
        // valeurs reconnues par Java, pas juste "3 lettres" / values Java recognises, not just "3 letters"
        try {
            ZoneId.of(request.timezone());
        } catch (DateTimeException e) {
            throw new RequeteInvalide("Fuseau horaire inconnu : " + request.timezone());
        }
        try {
            Currency.getInstance(request.currency());
        } catch (IllegalArgumentException e) {
            throw new RequeteInvalide("Devise inconnue : " + request.currency());
        }

        ParametrePlateforme p = courant();
        List<String> changements = new ArrayList<>();
        changer(changements, "platform_name", p.getPlatform_name(), request.platform_name());
        changer(changements, "support_email", p.getSupport_email(), request.support_email());
        changer(changements, "currency", p.getCurrency(), request.currency());
        changer(changements, "timezone", p.getTimezone(), request.timezone());
        changer(changements, "maintenance_mode", p.isMaintenance_mode(), request.maintenance_mode());
        changer(changements, "email_notifications", p.isEmail_notifications(), request.email_notifications());
        changer(changements, "open_registration", p.isOpen_registration(), request.open_registration());
        changer(changements, "max_logements_basic", p.getMax_logements_basic(), request.max_logements_basic());
        changer(changements, "max_logements_premium", p.getMax_logements_premium(), request.max_logements_premium());
        changer(changements, "max_upload_size_mb", p.getMax_upload_size_mb(), request.max_upload_size_mb());
        changer(changements, "session_duration_minutes", p.getSession_duration_minutes(), request.session_duration_minutes());

        p.setPlatform_name(request.platform_name());
        p.setSupport_email(request.support_email());
        p.setCurrency(request.currency());
        p.setTimezone(request.timezone());
        p.setMaintenance_mode(request.maintenance_mode());
        p.setEmail_notifications(request.email_notifications());
        p.setOpen_registration(request.open_registration());
        p.setMax_logements_basic(request.max_logements_basic());
        p.setMax_logements_premium(request.max_logements_premium());
        p.setMax_upload_size_mb(request.max_upload_size_mb());
        p.setSession_duration_minutes(request.session_duration_minutes());
        ParametrePlateforme maj = parametre_repository.save(p);

        service_audit.journal(JournalAudit.update, "PARAMETRES_MODIFIES",
                changements.isEmpty() ? "Aucun changement" : String.join(", ", changements), "PARAMETRES", null);
        return ParametresResponse.from(maj);
    }

    public ParametresResponse reinitialiser() {
        ParametrePlateforme p = courant();
        ParametrePlateforme defauts = new ParametrePlateforme();
        p.setPlatform_name(defauts.getPlatform_name());
        p.setSupport_email(defauts.getSupport_email());
        p.setCurrency(defauts.getCurrency());
        p.setTimezone(defauts.getTimezone());
        p.setMaintenance_mode(defauts.isMaintenance_mode());
        p.setEmail_notifications(defauts.isEmail_notifications());
        p.setOpen_registration(defauts.isOpen_registration());
        p.setMax_logements_basic(defauts.getMax_logements_basic());
        p.setMax_logements_premium(defauts.getMax_logements_premium());
        p.setMax_upload_size_mb(defauts.getMax_upload_size_mb());
        p.setSession_duration_minutes(defauts.getSession_duration_minutes());
        ParametrePlateforme maj = parametre_repository.save(p);
        service_audit.journal(JournalAudit.update, "PARAMETRES_REINITIALISES", "Valeurs par défaut restaurées",
                "PARAMETRES", null);
        return ParametresResponse.from(maj);
    }

    private static void changer(List<String> changements, String nom, Object avant, Object apres) {
        if (!Objects.equals(avant, apres)) {
            changements.add(nom + " : " + avant + " → " + apres);
        }
    }
}
