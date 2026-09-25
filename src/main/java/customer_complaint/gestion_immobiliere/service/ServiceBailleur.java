package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.BailleurRequest;
import customer_complaint.gestion_immobiliere.dto.BailleurResponse;
import customer_complaint.gestion_immobiliere.dto.QuittanceResponse;

import java.util.List;

public interface ServiceBailleur {

    BailleurResponse create(BailleurRequest request);

    List<BailleurResponse> list();

    BailleurResponse get(Long id);

    void delete(Long id);

    void manage_properties();

    QuittanceResponse generate_receipt(Long contrat_id);
}
