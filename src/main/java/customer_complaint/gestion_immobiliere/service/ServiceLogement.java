package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.LogementRequest;
import customer_complaint.gestion_immobiliere.dto.LogementResponse;

import java.util.List;

public interface ServiceLogement {

    LogementResponse create(LogementRequest request);

    List<LogementResponse> list();

    LogementResponse get(Long id);

    LogementResponse update(Long id, LogementRequest request);

    void delete(Long id);

    // assigne un locataire a une chambre / assigns a tenant to a room
    LogementResponse assigner(Long id, Long locataire_id, Long piece_id);

    // libere la chambre d'un locataire (il reste rattache au logement) / frees the room (tenant stays attached to the home)
    LogementResponse liberer(Long id, Long locataire_id);
}
