package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Quittance;

import java.util.List;

public interface ServiceQuittance {

    List<Quittance> list();

    Quittance get(Long id);

    byte[] generate_pdf(Long id);

    void send(Long id);
}
