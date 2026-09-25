package customer_complaint.gestion_immobiliere.dto;

import java.util.List;

// croissance_pct : nouveaux comptes du mois par rapport au parc existant en debut de mois
public record AdminDashboardResponse(Comptes bailleurs, Comptes locataires, int logements, int contrats_actifs,
                                     Abonnements abonnements, Revenus revenus, List<Revenu> revenus_7_mois,
                                     List<JournalResponse> activite_recente) {

    public record Comptes(int total, int actifs, int suspendus, int nouveaux_ce_mois, int croissance_pct) {
    }

    public record Abonnements(int actifs, int suspendus, List<ParPlan> par_plan) {
    }

    public record ParPlan(String plan, long abonnes) {
    }

    // mois : facturation simulee des abonnements / month: simulated subscription billing
    public record Revenus(String period, double mois_courant, double mois_precedent, int croissance_pct) {
    }

    public record Revenu(String period, double montant) {
    }
}
