package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Logement;
import customer_complaint.gestion_immobiliere.model.Piece;
import org.springframework.stereotype.Component;

// regles d'occupation des chambres, partagees par les services logement et locataire
// room occupancy rules, shared by the home and tenant services
@Component
public class AffectationPiece {

    public void affecter(Locataire locataire, Logement logement, Long piece_id) {
        Piece piece = logement.getPieces().stream().filter(p -> p.getId().equals(piece_id)).findFirst()
                .orElseThrow(() -> new RessourceIntrouvable("Chambre introuvable dans ce logement"));
        if (piece.getCapacite() <= 0) {
            throw new ConflitDonnees("La pièce " + piece.getNumero() + " est une pièce commune : on ne peut pas y loger un locataire");
        }
        Piece actuelle = locataire.getPiece();
        boolean deja_dedans = actuelle != null && actuelle.getId().equals(piece.getId());
        if (!deja_dedans && piece.getOccupants().size() >= piece.getCapacite()) {
            throw new ConflitDonnees("La chambre " + piece.getNumero() + " est complète (" + piece.getCapacite() + " place(s))");
        }
        if (deja_dedans) {
            return;
        }
        liberer(locataire);
        locataire.setLogement(logement);
        locataire.setPiece(piece);
        piece.getOccupants().add(locataire);
    }

    public void liberer(Locataire locataire) {
        Piece piece = locataire.getPiece();
        if (piece != null) {
            piece.getOccupants().removeIf(l -> l.getId() != null && l.getId().equals(locataire.getId()));
            locataire.setPiece(null);
        }
    }
}
