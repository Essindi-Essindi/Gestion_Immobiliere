package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Compte;
import org.springframework.stereotype.Service;

@Service
public class ServiceAuthentificationImpl implements ServiceAuthentification {

    @Override
    public Compte log_in(String email, String password) {
        return null;
    }

    @Override
    public void log_out() {
    }
}
