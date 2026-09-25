package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.BailleurRequest;
import customer_complaint.gestion_immobiliere.dto.BailleurResponse;
import customer_complaint.gestion_immobiliere.dto.QuittanceResponse;
import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Bailleur;
import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.Quittance;
import customer_complaint.gestion_immobiliere.repository.BailleurRepository;
import customer_complaint.gestion_immobiliere.repository.ContratRepository;
import customer_complaint.gestion_immobiliere.repository.QuittanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceBailleurImpl implements ServiceBailleur {

    private final ServiceAudit service_audit;
    private final BailleurRepository bailleur_repository;
    private final ContratRepository contrat_repository;
    private final QuittanceRepository quittance_repository;
    private final VerificationEmail verification_email;
    private final PasswordEncoder password_encoder;
    private final UtilisateurCourant utilisateur;
    private final ServiceDocument service_document;

    @Override
    public BailleurResponse create(BailleurRequest request) {
        if (request.password() == null) {
            throw new RequeteInvalide("Le mot de passe est obligatoire");
        }
        String email = verification_email.normaliser(request.email());
        verification_email.assurer_libre(email);

        Bailleur bailleur = new Bailleur();
        bailleur.setLast_name(request.last_name());
        bailleur.setFirst_name(request.first_name());
        bailleur.setEmail(email);
        bailleur.setPassword(password_encoder.encode(request.password()));
        bailleur.setPhone(request.phone());
        bailleur.setAddress(request.address());
        Bailleur cree = bailleur_repository.save(bailleur);
        service_audit.creation("BAILLEUR", cree.getId(), "Bailleur " + cree.getFirst_name() + " " + cree.getLast_name());
        return BailleurResponse.from(cree);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BailleurResponse> list() {
        return bailleur_repository.findAll().stream().map(BailleurResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BailleurResponse get(Long id) {
        return BailleurResponse.from(trouver(id));
    }

    @Override
    public void delete(Long id) {
        Bailleur bailleur = trouver(id);
        // regle du cahier: pas de suppression avec contrats / rule from the analysis: no deletion with contracts
        if (!bailleur.getContrats().isEmpty() || !bailleur.getLogements().isEmpty()) {
            throw new ConflitDonnees("Impossible de supprimer un bailleur qui a encore des logements ou des contrats");
        }
        bailleur_repository.delete(bailleur);
        service_audit.suppression("BAILLEUR", id, "Bailleur " + bailleur.getFirst_name() + " " + bailleur.getLast_name());
    }

    @Override
    public void manage_properties() {
    }

    @Override
    public QuittanceResponse generate_receipt(Long contrat_id) {
        // seulement pour un de ses propres contrats / only for one of their own contracts
        Contrat contrat = contrat_repository.findById(contrat_id)
                .filter(c -> c.getBailleur().getId().equals(utilisateur.id()))
                .orElseThrow(() -> new RessourceIntrouvable("Contrat introuvable : " + contrat_id));
        String period = YearMonth.now().toString();
        if (quittance_repository.existe_pour_periode(contrat_id, period)) {
            throw new ConflitDonnees("Une quittance existe déjà pour la période " + period);
        }

        Quittance quittance = new Quittance();
        quittance.setPeriod(period);
        quittance.setAmount(contrat.getMonthly_rent());
        quittance.setIssue_date(LocalDate.now());
        quittance.setContrat(contrat);
        Quittance creee = quittance_repository.save(quittance);
        service_document.creer_quittance(creee);
        return QuittanceResponse.from(creee);
    }

    private Bailleur trouver(Long id) {
        return bailleur_repository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvable("Bailleur introuvable : " + id));
    }
}
