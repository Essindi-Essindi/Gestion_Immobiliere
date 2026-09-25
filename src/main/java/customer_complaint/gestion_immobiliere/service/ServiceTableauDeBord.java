package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.DashboardResponse;
import customer_complaint.gestion_immobiliere.dto.LoyerResponse;
import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.Loyer;
import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Signalement;
import customer_complaint.gestion_immobiliere.model.Statuts;
import customer_complaint.gestion_immobiliere.repository.ContratRepository;
import customer_complaint.gestion_immobiliere.repository.LocataireRepository;
import customer_complaint.gestion_immobiliere.repository.LogementRepository;
import customer_complaint.gestion_immobiliere.repository.LoyerRepository;
import customer_complaint.gestion_immobiliere.repository.SignalementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// toutes les statistiques sont calculees sur les donnees du bailleur connecte uniquement
// every statistic is computed on the logged-in landlord's data only
@Service
@Transactional
@RequiredArgsConstructor
public class ServiceTableauDeBord {

    private final LogementRepository logement_repository;
    private final LocataireRepository locataire_repository;
    private final ContratRepository contrat_repository;
    private final LoyerRepository loyer_repository;
    private final SignalementRepository signalement_repository;
    private final ServiceLoyer service_loyer;
    private final UtilisateurCourant utilisateur;

    public DashboardResponse bailleur() {
        Long id = utilisateur.id();
        service_loyer.synchroniser(id);
        LocalDate today = LocalDate.now();

        // logements et occupation
        int total_logements = logement_repository.find_by_bailleur(id).size();
        List<Contrat> actifs = contrat_repository.find_actifs_by_bailleur(id);
        Set<Long> loues = new HashSet<>();
        actifs.forEach(c -> loues.add(c.getLogement().getId()));
        int taux = total_logements == 0 ? 0 : (int) Math.round(loues.size() * 100.0 / total_logements);

        // locataires
        List<Locataire> locataires = locataire_repository.list_pour_bailleur(id);
        int invites = (int) locataires.stream().filter(Locataire::isMust_change_password).count();

        // echeances : contrats qui se terminent dans 60 jours / contracts ending within 60 days
        List<DashboardResponse.Echeance> echeances = actifs.stream()
                .filter(c -> c.getEnd_date() != null && !c.getEnd_date().isAfter(today.plusDays(60)))
                .sorted(Comparator.comparing(Contrat::getEnd_date))
                .map(c -> new DashboardResponse.Echeance(c.getId(),
                        c.getLocataire().getFirst_name() + " " + c.getLocataire().getLast_name(),
                        c.getLogement().getAddress(), c.getEnd_date(), ChronoUnit.DAYS.between(today, c.getEnd_date())))
                .toList();

        // loyers
        List<Loyer> loyers = loyer_repository.find_by_bailleur(id);
        String mois = YearMonth.now().toString();
        double attendu = somme(loyers, mois, false);
        double encaisse = somme(loyers, mois, true);
        int taux_recouvrement = attendu == 0 ? 0 : (int) Math.round(encaisse * 100.0 / attendu);

        List<Loyer> en_retard = loyers.stream()
                .filter(l -> Statuts.en_retard.equals(LoyerResponse.statut(l))).toList();
        Set<Long> locataires_en_retard = new HashSet<>();
        en_retard.forEach(l -> locataires_en_retard.add(l.getContrat().getLocataire().getId()));

        // 6 derniers mois, du plus ancien au plus recent / last 6 months, oldest first
        List<DashboardResponse.Revenu> revenus = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            String p = YearMonth.now().minusMonths(i).toString();
            revenus.add(new DashboardResponse.Revenu(p, somme(loyers, p, false), somme(loyers, p, true)));
        }

        // interventions
        List<Signalement> interventions = signalement_repository.find_by_bailleur(id);

        return new DashboardResponse(
                new DashboardResponse.Logements(total_logements, loues.size(), total_logements - loues.size(), taux),
                new DashboardResponse.Locataires(locataires.size(), locataires.size() - invites, invites),
                new DashboardResponse.Contrats(actifs.size(), echeances.size()),
                new DashboardResponse.LoyersMois(mois, attendu, encaisse, attendu - encaisse, taux_recouvrement),
                new DashboardResponse.Arrieres(locataires_en_retard.size(), en_retard.size(),
                        en_retard.stream().mapToDouble(Loyer::getAmount).sum()),
                new DashboardResponse.Interventions(compter(interventions, Statuts.nouveau),
                        compter(interventions, Statuts.en_cours), compter(interventions, Statuts.termine)),
                revenus, echeances);
    }

    private static double somme(List<Loyer> loyers, String period, boolean seulement_payes) {
        return loyers.stream()
                .filter(l -> l.getPeriod().equals(period))
                .filter(l -> !seulement_payes || l.getPaid_date() != null)
                .mapToDouble(Loyer::getAmount).sum();
    }

    private static int compter(List<Signalement> signalements, String statut) {
        return (int) signalements.stream().filter(s -> statut.equals(s.getStatus())).count();
    }
}
