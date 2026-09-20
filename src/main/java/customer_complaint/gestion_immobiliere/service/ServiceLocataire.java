package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Signalement;

import java.util.List;

public interface ServiceLocataire {

    Locataire create(Locataire locataire);

    List<Locataire> list();

    Locataire get(Long id);

    Locataire update(Long id, Locataire locataire);

    void delete(Long id);

    Signalement report_issue(Signalement signalement);

    Contrat view_contract(Long id);
}
