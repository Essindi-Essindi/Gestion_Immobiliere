package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Logement;

import java.util.List;

public interface ServiceLogement {

    Logement create(Logement logement);

    List<Logement> list();

    Logement get(Long id);

    Logement update(Long id, Logement logement);

    void delete(Long id);
}
