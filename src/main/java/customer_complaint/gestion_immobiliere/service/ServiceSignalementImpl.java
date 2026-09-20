package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Signalement;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceSignalementImpl implements ServiceSignalement {

    @Override
    public List<Signalement> list() {
        return null;
    }

    @Override
    public Signalement get(Long id) {
        return null;
    }

    @Override
    public void process(Long id) {
    }

    @Override
    public void close(Long id) {
    }
}
