package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Signalement;

import java.util.List;

public interface ServiceSignalement {

    List<Signalement> list();

    Signalement get(Long id);

    void process(Long id);

    void close(Long id);
}
