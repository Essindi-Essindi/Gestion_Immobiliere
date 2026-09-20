package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Quittance;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceQuittanceImpl implements ServiceQuittance {

    @Override
    public List<Quittance> list() {
        return null;
    }

    @Override
    public Quittance get(Long id) {
        return null;
    }

    @Override
    public byte[] generate_pdf(Long id) {
        return null;
    }

    @Override
    public void send(Long id) {
    }
}
