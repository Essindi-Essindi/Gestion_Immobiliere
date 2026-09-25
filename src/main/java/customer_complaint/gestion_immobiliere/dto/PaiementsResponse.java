package customer_complaint.gestion_immobiliere.dto;

import java.util.List;

// historique + totaux sur les elements filtres / history + totals over the filtered items
public record PaiementsResponse(List<PaiementResponse> items, double total_paye, double total_en_attente,
                                double total_en_retard) {
}
