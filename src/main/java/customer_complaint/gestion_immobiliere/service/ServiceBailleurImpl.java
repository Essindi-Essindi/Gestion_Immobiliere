package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Bailleur;
import customer_complaint.gestion_immobiliere.model.Quittance;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceBailleurImpl implements ServiceBailleur {

    @Override
    public Bailleur create(Bailleur bailleur) {
        return null;
    }

    @Override
    public List<Bailleur> list() {
        return null;
    }

    @Override
    public Bailleur get(Long id) {
        return null;
    }

    @Override
    public void delete(Long id) {
    }

    @Override
    public void manage_properties() {
    }

    @Override
    public Quittance generate_receipt(Long contrat_id) {
        return null;
    }
}
