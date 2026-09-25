package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.AdminDashboardResponse;
import customer_complaint.gestion_immobiliere.model.Abonnement;
import customer_complaint.gestion_immobiliere.model.Statuts;
import customer_complaint.gestion_immobiliere.repository.AbonnementRepository;
import customer_complaint.gestion_immobiliere.repository.BailleurRepository;
import customer_complaint.gestion_immobiliere.repository.ContratRepository;
import customer_complaint.gestion_immobiliere.repository.FactureRepository;
import customer_complaint.gestion_immobiliere.repository.LocataireRepository;
import customer_complaint.gestion_immobiliere.repository.LogementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ServiceAdminTableauDeBord {

    private final BailleurRepository bailleur_repository;
    private final LocataireRepository locataire_repository;
    private final LogementRepository logement_repository;
    private final ContratRepository contrat_repository;
    private final AbonnementRepository abonnement_repository;
    private final FactureRepository facture_repository;
    private final ServiceAudit service_audit;

    public AdminDashboardResponse tableau() {
        LocalDate debut_mois = YearMonth.now().atDay(1);

        int bailleurs = (int) bailleur_repository.count();
        int nouveaux_bailleurs = (int) bailleur_repository.count_crees_depuis(debut_mois.atStartOfDay());
        int locataires = (int) locataire_repository.count();
        int nouveaux_locataires = (int) locataire_repository.count_crees_depuis(debut_mois.atStartOfDay());

        // abonnements non resilies, regroupes par plan / non-terminated subscriptions grouped by plan
        List<Abonnement> abonnements = abonnement_repository.find_actuels();
        Map<String, Long> par_plan = new LinkedHashMap<>();
        abonnements.forEach(a -> par_plan.merge(a.getPlan().getName(), 1L, Long::sum));
        int actifs = (int) abonnements.stream().filter(a -> Statuts.actif.equals(a.getStatus())).count();

        // revenus : factures payees, sur les 7 derniers mois / revenue: paid invoices over the last 7 months
        YearMonth mois = YearMonth.now();
        List<AdminDashboardResponse.Revenu> serie = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            String periode = mois.minusMonths(i).toString();
            serie.add(new AdminDashboardResponse.Revenu(periode, facture_repository.revenus(periode)));
        }
        double courant = facture_repository.revenus(mois.toString());
        double precedent = facture_repository.revenus(mois.minusMonths(1).toString());

        return new AdminDashboardResponse(
                new AdminDashboardResponse.Comptes(bailleurs, (int) bailleur_repository.countByActive(true),
                        (int) bailleur_repository.countByActive(false), nouveaux_bailleurs,
                        croissance(nouveaux_bailleurs, bailleurs - nouveaux_bailleurs)),
                new AdminDashboardResponse.Comptes(locataires, (int) locataire_repository.countByActive(true),
                        (int) locataire_repository.countByActive(false), nouveaux_locataires,
                        croissance(nouveaux_locataires, locataires - nouveaux_locataires)),
                (int) logement_repository.count(), (int) contrat_repository.count_actifs(),
                new AdminDashboardResponse.Abonnements(actifs, abonnements.size() - actifs,
                        par_plan.entrySet().stream()
                                .map(e -> new AdminDashboardResponse.ParPlan(e.getKey(), e.getValue())).toList()),
                new AdminDashboardResponse.Revenus(mois.toString(), courant, precedent,
                        precedent == 0 ? (courant > 0 ? 100 : 0) : (int) Math.round((courant - precedent) * 100 / precedent)),
                serie,
                service_audit.rechercher("", null, null, null, 0, 10).content());
    }

    // nouveaux comptes du mois / parc existant en debut de mois, en % / new accounts vs base at start of month
    private static int croissance(int nouveaux, int base) {
        return base <= 0 ? (nouveaux > 0 ? 100 : 0) : (int) Math.round(nouveaux * 100.0 / base);
    }
}
