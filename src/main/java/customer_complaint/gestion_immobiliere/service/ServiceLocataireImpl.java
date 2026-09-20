package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Signalement;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceLocataireImpl implements ServiceLocataire {

    @Override
    public Locataire create(Locataire locataire) {
        return null;
    }

    @Override
    public List<Locataire> list() {
        return null;
    }

    @Override
    public Locataire get(Long id) {
        return null;
    }

    @Override
    public Locataire update(Long id, Locataire locataire) {
        return null;
    }

    @Override
    public void delete(Long id) {
    }

    @Override
    public Signalement report_issue(Signalement signalement) {
        return null;
    }

    @Override
    public Contrat view_contract(Long id) {
        return null;
    }
}
