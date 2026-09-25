package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.JournalResponse;
import customer_complaint.gestion_immobiliere.dto.PageResponse;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.model.JournalAudit;
import customer_complaint.gestion_immobiliere.repository.AdminRepository;
import customer_complaint.gestion_immobiliere.repository.BailleurRepository;
import customer_complaint.gestion_immobiliere.repository.JournalAuditRepository;
import customer_complaint.gestion_immobiliere.repository.LocataireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// qui a fait quoi, quand, d'ou. Les lignes ne sont jamais modifiees ni supprimees par l'application
// who did what, when, from where. Rows are never updated or deleted by the application
@Service
@RequiredArgsConstructor
public class ServiceAudit {

    private static final List<String> types = List.of(JournalAudit.login, JournalAudit.create, JournalAudit.update,
            JournalAudit.delete);

    private final JournalAuditRepository journal_repository;
    private final AdminRepository admin_repository;
    private final BailleurRepository bailleur_repository;
    private final LocataireRepository locataire_repository;

    // raccourcis : l'acteur est celui du jeton / shortcuts: the actor is the token's
    public void creation(String cible, Long id, String details) {
        journal(JournalAudit.create, cible + "_CREE", details, cible, id);
    }

    public void modification(String cible, Long id, String details) {
        journal(JournalAudit.update, cible + "_MODIFIE", details, cible, id);
    }

    public void suppression(String cible, Long id, String details) {
        journal(JournalAudit.delete, cible + "_SUPPRIME", details, cible, id);
    }

    @Transactional
    public void journal(String type, String action, String details, String target_type, Long target_id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt
                && jwt.getClaim("uid") instanceof Number uid) {
            String role = jwt.getClaim("role");
            journal_pour(role, uid.longValue(), nom_de(role, uid.longValue(), jwt.getSubject()), type, action,
                    details, target_type, target_id);
        } else {
            journal_pour("SYSTEME", null, "Système", type, action, details, target_type, target_id);
        }
    }

    // acteur explicite : connexion (le jeton n'existe pas encore) ou reinitialisation par lien
    // explicit actor: login (no token yet) or link-based reset
    @Transactional
    public void journal_pour(String role, Long id, String nom, String type, String action, String details,
                             String target_type, Long target_id) {
        JournalAudit journal = new JournalAudit();
        journal.setActor_role(role);
        journal.setActor_id(id);
        journal.setActor_name(tronquer(nom, 150));
        journal.setType(type);
        journal.setAction(tronquer(action, 40));
        journal.setDetails(tronquer(details == null ? "" : details, 500));
        journal.setTarget_type(target_type);
        journal.setTarget_id(target_id);
        journal.setIp(ip());
        journal_repository.save(journal);
    }

    @Transactional(readOnly = true)
    public PageResponse<JournalResponse> rechercher(String type, String q, LocalDate depuis, LocalDate jusqua,
                                                    int page, int size) {
        String code = type == null ? "" : type.trim().toUpperCase();
        if (!code.isEmpty() && !types.contains(code)) {
            throw new RequeteInvalide("Le type doit valoir LOGIN, CREATE, UPDATE ou DELETE");
        }
        if (depuis != null && jusqua != null && jusqua.isBefore(depuis)) {
            throw new RequeteInvalide("La date de fin doit être postérieure à la date de début");
        }
        String motif = "%" + (q == null ? "" : q.trim().toLowerCase()) + "%";
        LocalDateTime borne_basse = depuis == null ? LocalDateTime.of(1970, 1, 1, 0, 0) : depuis.atStartOfDay();
        LocalDateTime borne_haute = jusqua == null ? LocalDateTime.of(2200, 1, 1, 0, 0) : jusqua.plusDays(1).atStartOfDay();

        PageRequest pageable = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 200)),
                Sort.by(Sort.Direction.DESC, "created_at").and(Sort.by(Sort.Direction.DESC, "id")));
        Page<JournalAudit> resultat = journal_repository.rechercher(code, motif, borne_basse, borne_haute, pageable);
        return PageResponse.from(resultat, JournalResponse::from);
    }

    private String nom_de(String role, Long id, String repli) {
        String nom = switch (role == null ? "" : role) {
            case "ADMIN" -> admin_repository.findById(id).map(a -> a.getFirst_name() + " " + a.getLast_name()).orElse(null);
            case "BAILLEUR" -> bailleur_repository.findById(id).map(b -> b.getFirst_name() + " " + b.getLast_name()).orElse(null);
            case "LOCATAIRE" -> locataire_repository.findById(id).map(l -> l.getFirst_name() + " " + l.getLast_name()).orElse(null);
            default -> null;
        };
        return nom != null ? nom : (repli != null ? repli : "Inconnu");
    }

    // hors requete web (tache asynchrone) il n'y a pas d'adresse / outside a web request (async task) there is no address
    private static String ip() {
        return RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes
                ? attributes.getRequest().getRemoteAddr() : null;
    }

    private static String tronquer(String texte, int max) {
        return texte.length() <= max ? texte : texte.substring(0, max - 1) + "…";
    }
}
