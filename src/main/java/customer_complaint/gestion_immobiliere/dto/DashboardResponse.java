package customer_complaint.gestion_immobiliere.dto;

import java.time.LocalDate;
import java.util.List;

public record DashboardResponse(Logements logements, Locataires locataires, Contrats contrats, LoyersMois loyers_mois,
                                Arrieres arrieres, Interventions interventions, List<Revenu> revenus_6_mois,
                                List<Echeance> echeances) {

    public record Logements(int total, int loues, int vacants, int taux_occupation) {
    }

    // invites = invitation envoyee, mot de passe pas encore choisi
    public record Locataires(int total, int actifs, int invites) {
    }

    public record Contrats(int actifs, int expirant_60_jours) {
    }

    // mois courant : attendu / encaisse / reste a encaisser
    public record LoyersMois(String period, double attendu, double encaisse, double reste, int taux_recouvrement) {
    }

    public record Arrieres(int nb_locataires, int nb_loyers, double total_du) {
    }

    public record Interventions(int nouvelles, int en_cours, int terminees) {
    }

    public record Revenu(String period, double attendu, double encaisse) {
    }

    // contrats qui se terminent bientot / contracts ending soon
    public record Echeance(Long contrat_id, String locataire_name, String logement_address, LocalDate end_date,
                           long jours_restants) {
    }
}
