package customer_complaint.gestion_immobiliere.dto;

import java.time.LocalDate;
import java.util.List;

// resultat d'un passage de facturation simule / result of one simulated billing run
public record SimulationFacturationResponse(LocalDate date, int abonnements_factures, int factures_payees,
                                            int factures_en_echec, double montant_encaisse,
                                            List<FactureResponse> factures) {
}
