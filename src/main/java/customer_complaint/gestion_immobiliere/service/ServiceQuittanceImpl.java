package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.DocumentResponse;
import customer_complaint.gestion_immobiliere.dto.QuittanceRequest;
import customer_complaint.gestion_immobiliere.dto.QuittanceResponse;
import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.DocumentPdf;
import customer_complaint.gestion_immobiliere.model.Quittance;
import customer_complaint.gestion_immobiliere.repository.ContratRepository;
import customer_complaint.gestion_immobiliere.repository.QuittanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceQuittanceImpl implements ServiceQuittance {

    private final QuittanceRepository quittance_repository;
    private final ContratRepository contrat_repository;
    private final ServiceDocument service_document;
    private final EnvoiDocument envoi_document;
    private final UtilisateurCourant utilisateur;

    @Override
    public QuittanceResponse create(QuittanceRequest request) {
        Contrat contrat = contrat_repository.findById(request.contrat_id())
                .filter(c -> c.getBailleur().getId().equals(utilisateur.id()))
                .orElseThrow(() -> new RessourceIntrouvable("Contrat introuvable : " + request.contrat_id()));
        if (quittance_repository.existe_pour_periode(contrat.getId(), request.period())) {
            throw new ConflitDonnees("Une quittance existe déjà pour la période " + request.period());
        }

        Quittance quittance = new Quittance();
        quittance.setPeriod(request.period());
        quittance.setAmount(request.amount());
        quittance.setIssue_date(request.issue_date());
        quittance.setContrat(contrat);
        Quittance creee = quittance_repository.save(quittance);
        // PDF genere et envoye par e-mail apres validation / PDF generated and emailed after commit
        service_document.creer_quittance(creee);
        return QuittanceResponse.from(creee);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuittanceResponse> list() {
        List<Quittance> quittances = utilisateur.bailleur()
                ? quittance_repository.find_by_bailleur(utilisateur.id())
                : quittance_repository.findAll();
        return quittances.stream().map(QuittanceResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QuittanceResponse get(Long id) {
        return QuittanceResponse.from(visible(id));
    }

    @Override
    public FichierPdf generate_pdf(Long id) {
        return service_document.telecharger(DocumentPdf.quittance, id);
    }

    @Override
    public DocumentResponse document(Long id) {
        return service_document.statut(DocumentPdf.quittance, id);
    }

    @Override
    public DocumentResponse insert(Long id, String nom, byte[] contenu) {
        return service_document.inserer(DocumentPdf.quittance, id, nom, contenu);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> inserted() {
        return service_document.inseres(DocumentPdf.quittance);
    }

    @Override
    public DocumentResponse send(Long id) {
        return envoi_document.renvoyer(DocumentPdf.quittance, id);
    }

    // admin: tout ; bailleur du contrat ; locataire du contrat. 404 sinon / else 404
    private Quittance visible(Long id) {
        Quittance quittance = quittance_repository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvable("Quittance introuvable : " + id));
        Contrat contrat = quittance.getContrat();
        boolean autorise = utilisateur.admin()
                || (utilisateur.bailleur() && contrat.getBailleur().getId().equals(utilisateur.id()))
                || (utilisateur.locataire() && contrat.getLocataire().getId().equals(utilisateur.id()));
        if (!autorise) {
            throw new RessourceIntrouvable("Quittance introuvable : " + id);
        }
        return quittance;
    }
}
