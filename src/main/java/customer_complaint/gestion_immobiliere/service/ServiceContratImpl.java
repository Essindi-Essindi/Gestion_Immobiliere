package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Contrat;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceContratImpl implements ServiceContrat {

    @Override
    public Contrat create(Contrat contrat) {
        return null;
    }

    @Override
    public List<Contrat> list() {
        return null;
    }

    @Override
    public Contrat get(Long id) {
        return null;
    }

    @Override
    public void terminate(Long id) {
    }

    @Override
    public byte[] generate_pdf(Long id) {
        return null;
    }
}
