package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Piece;

import java.util.List;

public record PieceResponse(Long id, String numero, String type, int capacite, List<Occupant> occupants) {

    public record Occupant(Long locataire_id, String nom) {
    }

    public static PieceResponse from(Piece piece) {
        return new PieceResponse(piece.getId(), piece.getNumero(), piece.getType(), piece.getCapacite(),
                piece.getOccupants().stream()
                        .map(l -> new Occupant(l.getId(), l.getFirst_name() + " " + l.getLast_name())).toList());
    }
}
