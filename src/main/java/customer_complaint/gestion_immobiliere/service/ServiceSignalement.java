package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.SignalementResponse;

import java.util.List;

public interface ServiceSignalement {

    // status : filtre optionnel NOUVEAU / EN_COURS / TERMINE / optional filter
    List<SignalementResponse> list(String status);

    SignalementResponse get(Long id);

    // response : message facultatif au locataire / optional message to the tenant
    SignalementResponse process(Long id, String response);

    SignalementResponse close(Long id, String response);
}
