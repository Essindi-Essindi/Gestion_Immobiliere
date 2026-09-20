package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Bailleur;
import customer_complaint.gestion_immobiliere.model.Quittance;

import java.util.List;

public interface ServiceBailleur {

    Bailleur create(Bailleur bailleur);

    List<Bailleur> list();

    Bailleur get(Long id);

    void delete(Long id);

    void manage_properties();

    Quittance generate_receipt(Long contrat_id);
}
