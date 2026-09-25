package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.ContratResponse;
import customer_complaint.gestion_immobiliere.dto.DashboardLocataireResponse;
import customer_complaint.gestion_immobiliere.dto.LocataireResponse;
import customer_complaint.gestion_immobiliere.dto.LogementResponse;
import customer_complaint.gestion_immobiliere.dto.LoyerResponse;
import customer_complaint.gestion_immobiliere.dto.NouveauSignalementRequest;
import customer_complaint.gestion_immobiliere.dto.PaiementResponse;
import customer_complaint.gestion_immobiliere.dto.PaiementsResponse;
import customer_complaint.gestion_immobiliere.dto.ProfilLocataireRequest;
import customer_complaint.gestion_immobiliere.dto.QuittanceLocataireResponse;
import customer_complaint.gestion_immobiliere.dto.SignalementRequest;
import customer_complaint.gestion_immobiliere.dto.SignalementResponse;
import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Logement;
import customer_complaint.gestion_immobiliere.model.Loyer;
import customer_complaint.gestion_immobiliere.model.Quittance;
import customer_complaint.gestion_immobiliere.model.Signalement;
import customer_complaint.gestion_immobiliere.model.Statuts;
import customer_complaint.gestion_immobiliere.repository.ContratRepository;
import customer_complaint.gestion_immobiliere.repository.LocataireRepository;
import customer_complaint.gestion_immobiliere.repository.LoyerRepository;
import customer_complaint.gestion_immobiliere.repository.QuittanceRepository;
import customer_complaint.gestion_immobiliere.repository.SignalementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// espace du locataire connecte : l'identifiant vient TOUJOURS du jeton, jamais de l'URL ni du corps
// the logged-in tenant's space: the id ALWAYS comes from the token, never from the URL or body
@Service
@Transactional
@RequiredArgsConstructor
public class ServiceEspaceLocataire {

    private final ServiceAudit service_audit;
    private final LocataireRepository locataire_repository;
    private final ContratRepository contrat_repository;
    private final LoyerRepository loyer_repository;
    private final QuittanceRepository quittance_repository;
    private final SignalementRepository signalement_repository;
    private final ServiceLoyer service_loyer;
    private final ServiceLocataire service_locataire;
    private final ServiceNotification service_notification;
    private final UtilisateurCourant utilisateur;

    @Transactional(readOnly = true)
    public LocataireResponse profil() {
        return LocataireResponse.from(moi());
    }

    public LocataireResponse maj_profil(ProfilLocataireRequest request) {
        Locataire locataire = moi();
        locataire.setLast_name(request.last_name());
        locataire.setFirst_name(request.first_name());
        // edge case: champ absent = inchange (le formulaire du front n envoie pas la date de naissance) / absent field = unchanged
        if (request.phone() != null) {
            locataire.setPhone(request.phone());
        }
        if (request.birth_date() != null) {
            locataire.setBirth_date(request.birth_date());
        }
        service_audit.modification("LOCATAIRE", locataire.getId(), "Profil mis à jour par le locataire");
        return LocataireResponse.from(locataire_repository.save(locataire));
    }

    @Transactional(readOnly = true)
    public LogementResponse logement() {
        Optional<Contrat> contrat = contrat_courant();
        Logement logement = contrat.map(Contrat::getLogement).orElse(moi().getLogement());
        if (logement == null) {
            throw new RessourceIntrouvable("Aucun logement n'est rattaché à votre compte");
        }
        Contrat occupant = contrat.filter(c -> c.getLogement().getId().equals(logement.getId()))
                .filter(ContratResponse::est_actif).orElse(null);
        return LogementResponse.from(logement, occupant);
    }

    @Transactional(readOnly = true)
    public ContratResponse contrat() {
        return ContratResponse.from(contrat_courant()
                .orElseThrow(() -> new RessourceIntrouvable("Aucun contrat pour ce locataire")));
    }

    // seul geste qui autorise ensuite le bailleur a resilier / the only thing that lets the landlord terminate afterwards
    public ContratResponse demander_resiliation() {
        Contrat contrat = contrat_courant().filter(ContratResponse::est_actif)
                .orElseThrow(() -> new RequeteInvalide("Vous n'avez aucun contrat actif"));
        if (contrat.isResiliation_demandee()) {
            throw new ConflitDonnees("Une demande de résiliation est déjà en cours pour ce contrat");
        }
        contrat.setResiliation_demandee(true);
        Locataire moi = moi();
        service_notification.creer("BAILLEUR", contrat.getBailleur().getId(), "INFO", "Demande de résiliation",
                moi.getFirst_name() + " " + moi.getLast_name() + " souhaite résilier son contrat pour "
                        + contrat.getLogement().getAddress() + ".", "CONTRAT", contrat.getId());
        service_audit.modification("CONTRAT", contrat.getId(), "Résiliation demandée par le locataire");
        return ContratResponse.from(contrat);
    }

    // les mois qui viennent de commencer sont crees a la lecture / months that just started are created on read
    public PaiementsResponse paiements(Integer year, String status) {
        if (status != null && !List.of(Statuts.paye, Statuts.en_attente, Statuts.en_retard).contains(status)) {
            throw new RequeteInvalide("Le statut doit valoir PAYE, EN_ATTENTE ou EN_RETARD");
        }
        Long id = utilisateur.id();
        service_loyer.synchroniser_locataire(id);

        Map<String, Long> quittances = new HashMap<>();
        for (Quittance q : quittance_repository.find_by_locataire(id)) {
            quittances.put(q.getContrat().getId() + "|" + q.getPeriod(), q.getId());
        }
        List<PaiementResponse> items = loyer_repository.find_by_locataire(id).stream()
                .filter(l -> year == null || l.getPeriod().startsWith(year + "-"))
                .filter(l -> status == null || LoyerResponse.statut(l).equals(status))
                .map(l -> PaiementResponse.from(l, quittances.get(l.getContrat().getId() + "|" + l.getPeriod())))
                .toList();
        return new PaiementsResponse(items, total(items, Statuts.paye), total(items, Statuts.en_attente),
                total(items, Statuts.en_retard));
    }

    @Transactional(readOnly = true)
    public List<QuittanceLocataireResponse> quittances(Integer year) {
        return quittance_repository.find_by_locataire(utilisateur.id()).stream()
                .filter(q -> year == null || q.getPeriod().startsWith(year + "-"))
                .map(QuittanceLocataireResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SignalementResponse> signalements(String status) {
        if (status != null && !List.of(Statuts.nouveau, Statuts.en_cours, Statuts.termine).contains(status)) {
            throw new RequeteInvalide("Le statut doit valoir NOUVEAU, EN_COURS ou TERMINE");
        }
        return signalement_repository.find_by_locataire(utilisateur.id()).stream()
                .filter(s -> status == null || status.equals(s.getStatus()))
                .map(SignalementResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public SignalementResponse signalement(Long id) {
        // 404 si le signalement existe mais appartient a un autre locataire / 404 if it belongs to another tenant
        return signalement_repository.findById(id)
                .filter(s -> s.getLocataire().getId().equals(utilisateur.id()))
                .map(SignalementResponse::from)
                .orElseThrow(() -> new RessourceIntrouvable("Signalement introuvable : " + id));
    }

    // le logement est celui de mon contrat en cours ; le bailleur est prevenu par notification
    // the home is the one of my ongoing contract; the landlord is notified
    public SignalementResponse creer_signalement(NouveauSignalementRequest request) {
        LocalDate today = LocalDate.now();
        Contrat contrat = contrat_repository.find_by_locataire(utilisateur.id()).stream()
                .filter(c -> c.getEnd_date() == null || !c.getEnd_date().isBefore(today))
                .findFirst()
                .orElseThrow(() -> new RequeteInvalide(
                        "Vous n'avez aucun logement actif : impossible de créer un signalement"));
        return service_locataire.report_issue(utilisateur.id(), new SignalementRequest(request.title(),
                request.description(), request.category(), request.priority(), request.photo(),
                contrat.getLogement().getId()));
    }

    public DashboardLocataireResponse dashboard() {
        Long id = utilisateur.id();
        service_loyer.synchroniser_locataire(id);
        Optional<Contrat> contrat = contrat_courant();
        Logement logement = contrat.map(Contrat::getLogement).orElse(moi().getLogement());

        List<Loyer> loyers = loyer_repository.find_by_locataire(id);
        LocalDate dernier_paiement = loyers.stream().map(Loyer::getPaid_date).filter(d -> d != null)
                .max(Comparator.naturalOrder()).orElse(null);
        // prochaine echeance = le plus ancien loyer non paye / next due = the oldest unpaid rent
        Optional<Loyer> prochain = loyers.stream().filter(l -> l.getPaid_date() == null)
                .min(Comparator.comparing(Loyer::getDue_date));
        int ouverts = (int) signalement_repository.find_by_locataire(id).stream()
                .filter(s -> !Statuts.termine.equals(s.getStatus())).count();

        return new DashboardLocataireResponse(
                logement != null ? logement.getType() : null,
                logement != null ? logement.getAddress() : null,
                contrat.map(Contrat::getMonthly_rent).orElse(logement != null ? logement.getRent() : null),
                dernier_paiement,
                prochain.map(Loyer::getPeriod).orElse(null),
                prochain.map(Loyer::getDue_date).orElse(null),
                contrat.map(c -> new DashboardLocataireResponse.ContratResume(c.getId(), c.getLogement().getAddress(),
                        c.getMonthly_rent(), c.getStart_date(), c.getEnd_date())).orElse(null),
                ouverts, service_notification.non_lues(), service_notification.list(false, 3));
    }

    // contrat en cours, sinon le plus recent / ongoing contract, else the most recent
    private Optional<Contrat> contrat_courant() {
        List<Contrat> contrats = contrat_repository.find_by_locataire(utilisateur.id());
        return contrats.stream().filter(ContratResponse::est_actif).findFirst()
                .or(() -> contrats.stream().findFirst());
    }

    private Locataire moi() {
        return locataire_repository.findById(utilisateur.id())
                .orElseThrow(() -> new RessourceIntrouvable("Locataire introuvable"));
    }

    private static double total(List<PaiementResponse> items, String statut) {
        return items.stream().filter(p -> p.status().equals(statut)).mapToDouble(PaiementResponse::amount).sum();
    }
}
