package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.AdminBailleurResponse;
import customer_complaint.gestion_immobiliere.dto.AdminLocataireResponse;
import customer_complaint.gestion_immobiliere.dto.LogementResponse;
import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Abonnement;
import customer_complaint.gestion_immobiliere.model.Bailleur;
import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.JournalAudit;
import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Logement;
import customer_complaint.gestion_immobiliere.model.Statuts;
import customer_complaint.gestion_immobiliere.dto.ContratResponse;
import customer_complaint.gestion_immobiliere.repository.AbonnementRepository;
import customer_complaint.gestion_immobiliere.repository.BailleurRepository;
import customer_complaint.gestion_immobiliere.repository.ContratRepository;
import customer_complaint.gestion_immobiliere.repository.LocataireRepository;
import customer_complaint.gestion_immobiliere.repository.LogementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// vue admin des comptes : liste, detail, suspension, reactivation / admin view of accounts
@Service
@Transactional
@RequiredArgsConstructor
public class ServiceAdminUtilisateurs {

    private final BailleurRepository bailleur_repository;
    private final LocataireRepository locataire_repository;
    private final LogementRepository logement_repository;
    private final ContratRepository contrat_repository;
    private final AbonnementRepository abonnement_repository;
    private final ServiceSession service_session;
    private final ServiceAudit service_audit;

    // ---- bailleurs

    @Transactional(readOnly = true)
    public List<AdminBailleurResponse> bailleurs(String status, String q) {
        if (status != null && !List.of(Statuts.actif, Statuts.suspendu).contains(status)) {
            throw new RequeteInvalide("Le statut doit valoir ACTIF ou SUSPENDU");
        }
        Map<Long, Abonnement> abonnements = abonnement_repository.find_actuels().stream()
                .collect(Collectors.toMap(a -> a.getBailleur().getId(), a -> a, (a, b) -> a));
        Map<Long, Integer> logements = compter(logement_repository.compter_par_bailleur());
        Map<Long, Integer> locataires = compter(locataire_repository.compter_par_bailleur());

        return bailleur_repository.findAll().stream()
                .filter(b -> status == null || (b.isActive() ? Statuts.actif : Statuts.suspendu).equals(status))
                .filter(b -> correspond(q, b.getFirst_name(), b.getLast_name(), b.getEmail()))
                .sorted(Comparator.comparing(Bailleur::getCreated_at).reversed())
                .map(b -> AdminBailleurResponse.from(b, abonnements.get(b.getId()),
                        logements.getOrDefault(b.getId(), 0), locataires.getOrDefault(b.getId(), 0), null))
                .toList();
    }

    // detail : inclut ses logements et leurs occupants / detail: includes their homes and occupants
    @Transactional(readOnly = true)
    public AdminBailleurResponse bailleur(Long id) {
        Bailleur bailleur = trouver_bailleur(id);
        List<Logement> biens = logement_repository.find_by_bailleur(id);
        Map<Long, Contrat> occupants = new HashMap<>();
        if (!biens.isEmpty()) {
            contrat_repository.find_actifs_by_logements(biens.stream().map(Logement::getId).toList())
                    .forEach(c -> occupants.put(c.getLogement().getId(), c));
        }
        List<LogementResponse> logements = biens.stream()
                .map(l -> LogementResponse.from(l, occupants.get(l.getId()))).toList();
        return AdminBailleurResponse.from(bailleur, abonnement_repository.find_actuel(id).orElse(null), biens.size(),
                locataire_repository.list_pour_bailleur(id).size(), logements);
    }

    public AdminBailleurResponse suspendre_bailleur(Long id, String motif) {
        Bailleur bailleur = trouver_bailleur(id);
        if (!bailleur.isActive()) {
            throw new ConflitDonnees("Ce compte est déjà suspendu");
        }
        bailleur.setActive(false);
        bailleur.setSuspended_at(LocalDateTime.now());
        bailleur.setSuspension_reason(vide_en_null(motif));
        // les jetons deja emis meurent tout de suite / already-issued tokens die immediately
        service_session.revoquer_compte("BAILLEUR", id);
        service_audit.journal(JournalAudit.update, "COMPTE_SUSPENDU", details("Bailleur", bailleur.getFirst_name(),
                bailleur.getLast_name(), motif), "BAILLEUR", id);
        return bailleur(id);
    }

    public AdminBailleurResponse activer_bailleur(Long id) {
        Bailleur bailleur = trouver_bailleur(id);
        if (bailleur.isActive()) {
            throw new ConflitDonnees("Ce compte est déjà actif");
        }
        bailleur.setActive(true);
        bailleur.setSuspended_at(null);
        bailleur.setSuspension_reason(null);
        service_audit.journal(JournalAudit.update, "COMPTE_ACTIVE", details("Bailleur", bailleur.getFirst_name(),
                bailleur.getLast_name(), null), "BAILLEUR", id);
        return bailleur(id);
    }

    // ---- locataires

    @Transactional(readOnly = true)
    public List<AdminLocataireResponse> locataires(String status, String q) {
        if (status != null && !List.of(Statuts.actif, Statuts.invite, Statuts.suspendu).contains(status)) {
            throw new RequeteInvalide("Le statut doit valoir ACTIF, INVITE ou SUSPENDU");
        }
        Map<Long, List<Contrat>> contrats = contrat_repository.findAll().stream()
                .collect(Collectors.groupingBy(c -> c.getLocataire().getId()));

        return locataire_repository.findAll().stream()
                .map(l -> AdminLocataireResponse.from(l, statut_contrat(contrats.get(l.getId()))))
                .filter(l -> status == null || l.status().equals(status))
                .filter(l -> correspond(q, l.first_name(), l.last_name(), l.email()))
                .sorted(Comparator.comparing(AdminLocataireResponse::registered_at).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminLocataireResponse locataire(Long id) {
        Locataire locataire = trouver_locataire(id);
        return AdminLocataireResponse.from(locataire, statut_contrat(contrat_repository.find_by_locataire(id)));
    }

    public AdminLocataireResponse suspendre_locataire(Long id, String motif) {
        Locataire locataire = trouver_locataire(id);
        if (!locataire.isActive()) {
            throw new ConflitDonnees("Ce compte est déjà suspendu");
        }
        locataire.setActive(false);
        locataire.setSuspended_at(LocalDateTime.now());
        locataire.setSuspension_reason(vide_en_null(motif));
        service_session.revoquer_compte("LOCATAIRE", id);
        service_audit.journal(JournalAudit.update, "COMPTE_SUSPENDU", details("Locataire", locataire.getFirst_name(),
                locataire.getLast_name(), motif), "LOCATAIRE", id);
        return locataire(id);
    }

    public AdminLocataireResponse activer_locataire(Long id) {
        Locataire locataire = trouver_locataire(id);
        if (locataire.isActive()) {
            throw new ConflitDonnees("Ce compte est déjà actif");
        }
        locataire.setActive(true);
        locataire.setSuspended_at(null);
        locataire.setSuspension_reason(null);
        service_audit.journal(JournalAudit.update, "COMPTE_ACTIVE", details("Locataire", locataire.getFirst_name(),
                locataire.getLast_name(), null), "LOCATAIRE", id);
        return locataire(id);
    }

    // ---- utilitaires

    private Bailleur trouver_bailleur(Long id) {
        return bailleur_repository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvable("Bailleur introuvable : " + id));
    }

    private Locataire trouver_locataire(Long id) {
        return locataire_repository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvable("Locataire introuvable : " + id));
    }

    // ACTIF si un contrat est en cours, TERMINE s'il n'y a que des contrats finis, sinon AUCUN
    private static String statut_contrat(List<Contrat> contrats) {
        if (contrats == null || contrats.isEmpty()) {
            return "AUCUN";
        }
        return contrats.stream().anyMatch(ContratResponse::est_actif) ? "ACTIF" : "TERMINE";
    }

    private static Map<Long, Integer> compter(List<Object[]> lignes) {
        Map<Long, Integer> resultat = new HashMap<>();
        for (Object[] ligne : lignes) {
            resultat.put((Long) ligne[0], ((Number) ligne[1]).intValue());
        }
        return resultat;
    }

    private static boolean correspond(String q, String... champs) {
        if (q == null || q.isBlank()) {
            return true;
        }
        String recherche = q.trim().toLowerCase();
        for (String champ : champs) {
            if (champ != null && champ.toLowerCase().contains(recherche)) {
                return true;
            }
        }
        return false;
    }

    private static String vide_en_null(String texte) {
        return texte == null || texte.isBlank() ? null : texte.trim();
    }

    private static String details(String role, String prenom, String nom, String motif) {
        return role + " " + prenom + " " + nom + (motif == null || motif.isBlank() ? "" : " - motif : " + motif.trim());
    }
}
