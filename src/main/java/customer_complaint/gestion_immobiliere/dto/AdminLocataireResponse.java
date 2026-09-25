package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Statuts;

import java.time.LocalDateTime;

// status : ACTIF, INVITE (mot de passe pas encore choisi) ou SUSPENDU ; contrat : ACTIF, TERMINE ou AUCUN
public record AdminLocataireResponse(Long id, String name, String last_name, String first_name, String email,
                                     String phone, Long logement_id, String logement_address, String piece_numero, String contrat,
                                     String status, String suspension_reason, Long bailleur_id, String bailleur_name,
                                     LocalDateTime registered_at) {

    public static AdminLocataireResponse from(Locataire locataire, String contrat) {
        String statut = !locataire.isActive() ? Statuts.suspendu
                : locataire.isMust_change_password() ? Statuts.invite : Statuts.actif;
        return new AdminLocataireResponse(locataire.getId(),
                locataire.getFirst_name() + " " + locataire.getLast_name(), locataire.getLast_name(),
                locataire.getFirst_name(), locataire.getEmail(), locataire.getPhone(),
                locataire.getLogement() != null ? locataire.getLogement().getId() : null,
                locataire.getLogement() != null ? locataire.getLogement().getAddress() : null,
                locataire.getPiece() != null ? locataire.getPiece().getNumero() : null, contrat, statut,
                locataire.getSuspension_reason(),
                locataire.getBailleur() != null ? locataire.getBailleur().getId() : null,
                locataire.getBailleur() != null
                        ? locataire.getBailleur().getFirst_name() + " " + locataire.getBailleur().getLast_name() : null,
                locataire.getCreated_at());
    }
}
