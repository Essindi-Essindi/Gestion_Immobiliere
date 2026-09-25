package customer_complaint.gestion_immobiliere.dto;

import java.time.LocalDate;
import java.util.List;

// impayes en retard regroupes par locataire / overdue rents grouped by tenant
public record ArrieresResponse(Long locataire_id, String locataire_name, String logement_address,
                               List<String> periods, int nb_mois, double total_du, LocalDate plus_ancienne_echeance) {
}
