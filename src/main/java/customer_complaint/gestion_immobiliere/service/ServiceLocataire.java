package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.ContratResponse;
import customer_complaint.gestion_immobiliere.dto.LocataireRequest;
import customer_complaint.gestion_immobiliere.dto.LocataireResponse;
import customer_complaint.gestion_immobiliere.dto.SignalementRequest;
import customer_complaint.gestion_immobiliere.dto.SignalementResponse;

import java.util.List;

public interface ServiceLocataire {

    LocataireResponse create(LocataireRequest request);

    // logement_id : filtre optionnel / optional filter
    List<LocataireResponse> list(Long logement_id);

    LocataireResponse get(Long id);

    LocataireResponse update(Long id, LocataireRequest request);

    void delete(Long id);

    SignalementResponse report_issue(Long id, SignalementRequest request);

    ContratResponse view_contract(Long id);
}
