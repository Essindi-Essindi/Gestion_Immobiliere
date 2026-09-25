package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.AbonnementRequest;
import customer_complaint.gestion_immobiliere.dto.AbonnementResponse;
import customer_complaint.gestion_immobiliere.dto.FactureResponse;
import customer_complaint.gestion_immobiliere.dto.PlanRequest;
import customer_complaint.gestion_immobiliere.dto.PlanResponse;
import customer_complaint.gestion_immobiliere.dto.SimulationFacturationResponse;
import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Abonnement;
import customer_complaint.gestion_immobiliere.model.Bailleur;
import customer_complaint.gestion_immobiliere.model.Facture;
import customer_complaint.gestion_immobiliere.model.JournalAudit;
import customer_complaint.gestion_immobiliere.model.PlanAbonnement;
import customer_complaint.gestion_immobiliere.model.Statuts;
import customer_complaint.gestion_immobiliere.repository.AbonnementRepository;
import customer_complaint.gestion_immobiliere.repository.BailleurRepository;
import customer_complaint.gestion_immobiliere.repository.FactureRepository;
import customer_complaint.gestion_immobiliere.repository.LogementRepository;
import customer_complaint.gestion_immobiliere.repository.PlanAbonnementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

// plans, abonnements des bailleurs et facturation SIMULEE (aucun vrai paiement)
// plans, landlord subscriptions and SIMULATED billing (no real payment)
@Service
@Transactional
@RequiredArgsConstructor
public class ServiceAbonnement {

    // garde-fou : une simulation lointaine ne doit pas generer des milliers de factures / safety cap on far-future simulations
    private static final int max_periodes_par_abonnement = 24;

    private final PlanAbonnementRepository plan_repository;
    private final AbonnementRepository abonnement_repository;
    private final FactureRepository facture_repository;
    private final BailleurRepository bailleur_repository;
    private final LogementRepository logement_repository;
    private final ServiceAudit service_audit;

    // ---- plans

    @Transactional(readOnly = true)
    public List<PlanResponse> plans() {
        return plan_repository.findAll().stream()
                .sorted(java.util.Comparator.comparingDouble(PlanAbonnement::getPrice))
                .map(p -> PlanResponse.from(p, abonnement_repository.count_actuels_by_plan(p.getId())))
                .toList();
    }

    public PlanResponse creer_plan(PlanRequest request) {
        if (plan_repository.existsByNameIgnoreCase(request.name().trim())) {
            throw new ConflitDonnees("Un plan nommé « " + request.name().trim() + " » existe déjà");
        }
        PlanAbonnement plan = new PlanAbonnement();
        appliquer(plan, request);
        PlanAbonnement cree = plan_repository.save(plan);
        service_audit.creation("PLAN", cree.getId(), "Plan " + cree.getName() + " à " + cree.getPrice() + " EUR");
        return PlanResponse.from(cree, 0);
    }

    public PlanResponse modifier_plan(Long id, PlanRequest request) {
        PlanAbonnement plan = plan(id);
        if (plan_repository.existsByNameIgnoreCaseAndIdNot(request.name().trim(), id)) {
            throw new ConflitDonnees("Un plan nommé « " + request.name().trim() + " » existe déjà");
        }
        appliquer(plan, request);
        PlanAbonnement maj = plan_repository.save(plan);
        service_audit.modification("PLAN", id, "Plan " + maj.getName() + " modifié (prix " + maj.getPrice() + " EUR)");
        return PlanResponse.from(maj, abonnement_repository.count_actuels_by_plan(id));
    }

    public PlanResponse suspendre_plan(Long id) {
        PlanAbonnement plan = plan(id);
        if (plan.isSuspended()) {
            throw new ConflitDonnees("Ce plan est déjà suspendu");
        }
        plan.setSuspended(true);
        service_audit.journal(JournalAudit.update, "PLAN_SUSPENDU", "Plan " + plan.getName(), "PLAN", id);
        return PlanResponse.from(plan, abonnement_repository.count_actuels_by_plan(id));
    }

    public PlanResponse activer_plan(Long id) {
        PlanAbonnement plan = plan(id);
        if (!plan.isSuspended()) {
            throw new ConflitDonnees("Ce plan est déjà actif");
        }
        plan.setSuspended(false);
        service_audit.journal(JournalAudit.update, "PLAN_ACTIVE", "Plan " + plan.getName(), "PLAN", id);
        return PlanResponse.from(plan, abonnement_repository.count_actuels_by_plan(id));
    }

    public void supprimer_plan(Long id) {
        PlanAbonnement plan = plan(id);
        // meme resilie, un abonnement garde son historique de factures / even terminated, a subscription keeps its invoices
        if (abonnement_repository.count_by_plan(id) > 0) {
            throw new ConflitDonnees("Ce plan a des abonnements (même résiliés) : suspendez-le plutôt que le supprimer");
        }
        plan_repository.delete(plan);
        service_audit.suppression("PLAN", id, "Plan " + plan.getName());
    }

    // ---- abonnements

    @Transactional(readOnly = true)
    public List<AbonnementResponse> abonnements(String status, Long plan_id) {
        if (status != null && !List.of(Statuts.actif, Statuts.suspendu, Statuts.resilie).contains(status)) {
            throw new RequeteInvalide("Le statut doit valoir ACTIF, SUSPENDU ou RESILIE");
        }
        return abonnement_repository.find_tous().stream()
                .filter(a -> status == null || a.getStatus().equals(status))
                .filter(a -> plan_id == null || a.getPlan().getId().equals(plan_id))
                .map(AbonnementResponse::from)
                .toList();
    }

    public AbonnementResponse souscrire(AbonnementRequest request) {
        Bailleur bailleur = bailleur_repository.findById(request.bailleur_id())
                .orElseThrow(() -> new RessourceIntrouvable("Bailleur introuvable : " + request.bailleur_id()));
        PlanAbonnement plan = plan(request.plan_id());
        if (plan.isSuspended()) {
            throw new ConflitDonnees("Ce plan est suspendu : aucune nouvelle souscription possible");
        }
        if (abonnement_repository.find_actuel(bailleur.getId()).isPresent()) {
            throw new ConflitDonnees("Ce bailleur a déjà un abonnement en cours : changez son plan ou résiliez-le");
        }
        verifier_capacite(bailleur, plan);

        LocalDate aujourdhui = LocalDate.now();
        Abonnement abonnement = new Abonnement();
        abonnement.setBailleur(bailleur);
        abonnement.setPlan(plan);
        abonnement.setStart_date(aujourdhui);
        abonnement.setNext_billing_date(aujourdhui.plusMonths(plan.getPeriod_months()));
        Abonnement cree = abonnement_repository.save(abonnement);

        // premiere facture, "payee" tout de suite (simulation) / first invoice, "paid" immediately (simulation)
        facturer(cree, YearMonth.from(aujourdhui).toString(), aujourdhui, aujourdhui, bailleur.isActive());
        service_audit.creation("ABONNEMENT", cree.getId(), bailleur.getFirst_name() + " " + bailleur.getLast_name()
                + " souscrit au plan " + plan.getName());
        return AbonnementResponse.from(cree);
    }

    public AbonnementResponse changer_plan(Long id, Long plan_id) {
        Abonnement abonnement = abonnement(id);
        if (Statuts.resilie.equals(abonnement.getStatus())) {
            throw new ConflitDonnees("Cet abonnement est résilié");
        }
        PlanAbonnement plan = plan(plan_id);
        if (plan.getId().equals(abonnement.getPlan().getId())) {
            throw new ConflitDonnees("Le bailleur est déjà sur ce plan");
        }
        if (plan.isSuspended()) {
            throw new ConflitDonnees("Ce plan est suspendu : aucune nouvelle souscription possible");
        }
        verifier_capacite(abonnement.getBailleur(), plan);
        String ancien = abonnement.getPlan().getName();
        abonnement.setPlan(plan);
        service_audit.modification("ABONNEMENT", id, "Plan " + ancien + " → " + plan.getName() + " pour "
                + abonnement.getBailleur().getFirst_name() + " " + abonnement.getBailleur().getLast_name());
        return AbonnementResponse.from(abonnement);
    }

    public AbonnementResponse suspendre_abonnement(Long id) {
        Abonnement abonnement = abonnement(id);
        if (!Statuts.actif.equals(abonnement.getStatus())) {
            throw new ConflitDonnees("Seul un abonnement ACTIF peut être suspendu");
        }
        abonnement.setStatus(Statuts.suspendu);
        service_audit.journal(JournalAudit.update, "ABONNEMENT_SUSPENDU", "Abonnement de "
                + abonnement.getBailleur().getFirst_name() + " " + abonnement.getBailleur().getLast_name(),
                "ABONNEMENT", id);
        return AbonnementResponse.from(abonnement);
    }

    public AbonnementResponse reprendre_abonnement(Long id) {
        Abonnement abonnement = abonnement(id);
        if (!Statuts.suspendu.equals(abonnement.getStatus())) {
            throw new ConflitDonnees("Seul un abonnement SUSPENDU peut être repris");
        }
        abonnement.setStatus(Statuts.actif);
        // pas de rattrapage des mois suspendus : on repart d'aujourd'hui / no catch-up for suspended months
        if (abonnement.getNext_billing_date().isBefore(LocalDate.now())) {
            abonnement.setNext_billing_date(LocalDate.now());
        }
        service_audit.journal(JournalAudit.update, "ABONNEMENT_REPRIS", "Abonnement de "
                + abonnement.getBailleur().getFirst_name() + " " + abonnement.getBailleur().getLast_name(),
                "ABONNEMENT", id);
        return AbonnementResponse.from(abonnement);
    }

    public AbonnementResponse resilier(Long id) {
        Abonnement abonnement = abonnement(id);
        if (Statuts.resilie.equals(abonnement.getStatus())) {
            throw new ConflitDonnees("Cet abonnement est déjà résilié");
        }
        abonnement.setStatus(Statuts.resilie);
        abonnement.setEnded_on(LocalDate.now());
        service_audit.journal(JournalAudit.delete, "ABONNEMENT_RESILIE", "Abonnement de "
                + abonnement.getBailleur().getFirst_name() + " " + abonnement.getBailleur().getLast_name(),
                "ABONNEMENT", id);
        return AbonnementResponse.from(abonnement);
    }

    // ---- facturation simulee

    @Transactional(readOnly = true)
    public List<FactureResponse> factures(Long bailleur_id, String status) {
        if (status != null && !List.of(Statuts.payee, Statuts.en_attente, Statuts.echec).contains(status)) {
            throw new RequeteInvalide("Le statut doit valoir PAYEE, EN_ATTENTE ou ECHEC");
        }
        return facture_repository.find_toutes().stream()
                .filter(f -> bailleur_id == null || f.getBailleur().getId().equals(bailleur_id))
                .filter(f -> status == null || f.getStatus().equals(status))
                .map(FactureResponse::from)
                .toList();
    }

    // un passage de facturation "a la date donnee" : utile pour simuler les mois qui passent
    // a billing run "at the given date": handy to simulate months going by
    public SimulationFacturationResponse simuler(LocalDate date) {
        LocalDate jour = date == null ? LocalDate.now() : date;
        List<Facture> factures = new ArrayList<>();

        for (Abonnement abonnement : abonnement_repository.find_a_facturer(jour)) {
            int periodes = 0;
            while (!abonnement.getNext_billing_date().isAfter(jour) && periodes++ < max_periodes_par_abonnement) {
                LocalDate echeance = abonnement.getNext_billing_date();
                String period = YearMonth.from(echeance).toString();
                // le paiement simule echoue si le compte du bailleur est suspendu / simulated payment fails for a suspended landlord
                if (!facture_repository.existe(abonnement.getId(), period)) {
                    factures.add(facturer(abonnement, period, echeance, jour, abonnement.getBailleur().isActive()));
                }
                abonnement.setNext_billing_date(echeance.plusMonths(abonnement.getPlan().getPeriod_months()));
            }
        }

        int payees = (int) factures.stream().filter(f -> Statuts.payee.equals(f.getStatus())).count();
        double encaisse = factures.stream().filter(f -> Statuts.payee.equals(f.getStatus()))
                .mapToDouble(Facture::getAmount).sum();
        service_audit.journal(JournalAudit.create, "FACTURATION_SIMULEE", factures.size() + " facture(s), "
                + encaisse + " EUR encaissés (simulation au " + jour + ")", "FACTURE", null);
        return new SimulationFacturationResponse(jour, (int) factures.stream().map(f -> f.getAbonnement().getId())
                .distinct().count(), payees, factures.size() - payees, encaisse,
                factures.stream().map(FactureResponse::from).toList());
    }

    public FactureResponse changer_statut_facture(Long id, String status) {
        Facture facture = facture_repository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvable("Facture introuvable : " + id));
        facture.setStatus(status);
        facture.setPaid_on(Statuts.payee.equals(status) ? LocalDate.now() : null);
        service_audit.journal(JournalAudit.update, "FACTURE_MODIFIEE", "Facture " + facture.getReference()
                + " → " + status, "FACTURE", id);
        return FactureResponse.from(facture);
    }

    // ---- utilise par la creation de logement / used by home creation

    @Transactional(readOnly = true)
    public void verifier_limite_logements(Long bailleur_id) {
        Optional<Abonnement> abonnement = abonnement_repository.find_actuel(bailleur_id);
        if (abonnement.isEmpty()) {
            return;
        }
        if (Statuts.suspendu.equals(abonnement.get().getStatus())) {
            throw new ConflitDonnees("Votre abonnement est suspendu : impossible d'ajouter un logement");
        }
        Integer maximum = abonnement.get().getPlan().getMax_logements();
        if (maximum != null && logement_repository.count_by_bailleur(bailleur_id) >= maximum) {
            throw new ConflitDonnees("La limite de votre plan " + abonnement.get().getPlan().getName()
                    + " est atteinte (" + maximum + " logements)");
        }
    }

    // ---- utilitaires

    private Facture facturer(Abonnement abonnement, String period, LocalDate emise, LocalDate jour, boolean paiement_ok) {
        Facture facture = new Facture();
        facture.setAbonnement(abonnement);
        facture.setBailleur(abonnement.getBailleur());
        facture.setPlan_name(abonnement.getPlan().getName());
        facture.setPeriod(period);
        facture.setAmount(abonnement.getPlan().getPrice());
        facture.setIssued_on(emise);
        facture.setStatus(paiement_ok ? Statuts.payee : Statuts.echec);
        facture.setPaid_on(paiement_ok ? jour : null);
        Facture enregistree = facture_repository.save(facture);
        enregistree.setReference("FAC-" + emise.getYear() + "-" + String.format("%05d", enregistree.getId()));
        return enregistree;
    }

    // un plan plus petit que le parc actuel du bailleur serait incoherent / a plan smaller than the current portfolio is inconsistent
    private void verifier_capacite(Bailleur bailleur, PlanAbonnement plan) {
        long logements = logement_repository.count_by_bailleur(bailleur.getId());
        if (plan.getMax_logements() != null && logements > plan.getMax_logements()) {
            throw new ConflitDonnees("Le bailleur a " + logements + " logements : le plan " + plan.getName()
                    + " est limité à " + plan.getMax_logements());
        }
    }

    private void appliquer(PlanAbonnement plan, PlanRequest request) {
        plan.setName(request.name().trim());
        plan.setPrice(request.price());
        plan.setPeriod_months(request.period_months());
        plan.getFeatures().clear();
        if (request.features() != null) {
            request.features().stream().map(String::trim).filter(f -> !f.isEmpty()).forEach(plan.getFeatures()::add);
        }
        plan.setMax_logements(request.max_logements());
        plan.setHighlighted(Boolean.TRUE.equals(request.highlighted()));
    }

    private PlanAbonnement plan(Long id) {
        return plan_repository.findById(id).orElseThrow(() -> new RessourceIntrouvable("Plan introuvable : " + id));
    }

    private Abonnement abonnement(Long id) {
        return abonnement_repository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvable("Abonnement introuvable : " + id));
    }
}
