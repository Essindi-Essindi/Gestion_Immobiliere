package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Contrat;

import java.util.List;

public interface ServiceContrat {

    Contrat create(Contrat contrat);

    List<Contrat> list();

    Contrat get(Long id);

    void terminate(Long id);

    byte[] generate_pdf(Long id);
}
