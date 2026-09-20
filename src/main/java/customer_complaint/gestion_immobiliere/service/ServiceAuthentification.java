package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Compte;

public interface ServiceAuthentification {

    Compte log_in(String email, String password);

    void log_out();
}
