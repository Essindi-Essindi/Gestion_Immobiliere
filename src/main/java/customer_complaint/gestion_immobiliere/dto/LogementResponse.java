package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.Logement;
import customer_complaint.gestion_immobiliere.model.Statuts;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

// status : LOUE si un contrat est en cours aujourd'hui, sinon VACANT / LOUE if a contract is ongoing today, else VACANT
public record LogementResponse(Long id, String address, String postal_code, String city, String country, String type,
                               double area, double rent, double charges, String status,
                               Long locataire_id, String locataire_name, Long bailleur_id,
                               List<PieceResponse> pieces, LocalDateTime created_at, LocalDateTime updated_at) {

    public static LogementResponse from(Logement logement, Contrat occupant) {
        List<PieceResponse> pieces = logement.getPieces().stream()
                .sorted(Comparator.comparing(p -> p.getId() == null ? 0L : p.getId()))
                .map(PieceResponse::from).toList();
        return new LogementResponse(logement.getId(), logement.getAddress(), logement.getPostal_code(),
                logement.getCity(), logement.getCountry(), logement.getType(), logement.getArea(),
                logement.getRent(), logement.getCharges(),
                occupant != null ? Statuts.loue : Statuts.vacant,
                occupant != null ? occupant.getLocataire().getId() : null,
                occupant != null ? occupant.getLocataire().getFirst_name() + " " + occupant.getLocataire().getLast_name() : null,
                logement.getBailleur().getId(), pieces, logement.getCreated_at(), logement.getUpdated_at());
    }
}
