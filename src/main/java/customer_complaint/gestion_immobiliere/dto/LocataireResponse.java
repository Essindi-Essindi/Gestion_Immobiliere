package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Locataire;

import java.time.LocalDate;
import java.time.LocalDateTime;

// activated : faux tant que le locataire n'a pas choisi son mot de passe (invitation en attente)
// piece_* : chambre occupee dans le logement / room occupied in the home
public record LocataireResponse(Long id, String last_name, String first_name, String email, String phone,
                                LocalDate birth_date, Long logement_id, String logement_address, Long piece_id,
                                String piece_numero, String piece_type, boolean activated,
                                LocalDateTime created_at, LocalDateTime updated_at) {

    public static LocataireResponse from(Locataire locataire) {
        return new LocataireResponse(locataire.getId(), locataire.getLast_name(), locataire.getFirst_name(),
                locataire.getEmail(), locataire.getPhone(), locataire.getBirth_date(),
                locataire.getLogement() != null ? locataire.getLogement().getId() : null,
                locataire.getLogement() != null ? locataire.getLogement().getAddress() : null,
                locataire.getPiece() != null ? locataire.getPiece().getId() : null,
                locataire.getPiece() != null ? locataire.getPiece().getNumero() : null,
                locataire.getPiece() != null ? locataire.getPiece().getType() : null,
                !locataire.isMust_change_password(), locataire.getCreated_at(), locataire.getUpdated_at());
    }
}
