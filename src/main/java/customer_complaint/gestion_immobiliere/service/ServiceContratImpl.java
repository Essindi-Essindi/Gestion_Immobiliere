package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.ContratRequest;
import customer_complaint.gestion_immobiliere.dto.ContratResponse;
import customer_complaint.gestion_immobiliere.dto.DocumentResponse;
import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Bailleur;
import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.DocumentPdf;
import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Logement;
import customer_complaint.gestion_immobiliere.model.Statuts;
import customer_complaint.gestion_immobiliere.repository.BailleurRepository;
import customer_complaint.gestion_immobiliere.repository.ContratRepository;
import customer_complaint.gestion_immobiliere.repository.LocataireRepository;
import customer_complaint.gestion_immobiliere.repository.LogementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceContratImpl implements ServiceContrat {

    private final ServiceAudit service_audit;
    private final ContratRepository contrat_repository;
    private final LogementRepository logement_repository;
    private final BailleurRepository bailleur_repository;
    private final LocataireRepository locataire_repository;
    private final ServiceLoyer service_loyer;
    private final ServiceNotification service_notification;
    private final ServiceDocument service_document;
    private final EnvoiDocument envoi_document;
    private final UtilisateurCourant utilisateur;

    @Override
    public ContratResponse create(ContratRequest request) {
        Long bailleur_id = utilisateur.id();
        Bailleur bailleur = bailleur_repository.findById(bailleur_id)
                .orElseThrow(() -> new RessourceIntrouvable("Bailleur introuvable"));

        // 1) le logement est a moi (404 sinon, on ne revele rien) / the home is mine
        Logement logement = logement_repository.findById(request.logement_id())
                .filter(l -> l.getBailleur().getId().equals(bailleur_id))
                .orElseThrow(() -> new RessourceIntrouvable("Logement introuvable : " + request.logement_id()));
        // 2) le locataire est a moi / the tenant is mine
        Locataire locataire = locataire_repository.findById(request.locataire_id())
                .filter(l -> locataire_repository.lie_au_bailleur(l.getId(), bailleur_id))
                .orElseThrow(() -> new RessourceIntrouvable("Locataire introuvable : " + request.locataire_id()));
        // 3) le locataire est rattache a CE logement (regle du cahier d'analyse) / the tenant is attached to THIS home
        if (locataire.getLogement() == null || !locataire.getLogement().getId().equals(logement.getId())) {
            throw new RequeteInvalide("Le locataire n'est pas rattaché à ce logement");
        }
        // 4) pas deux contrats actifs sur le meme logement : aucune periode ne doit se chevaucher
        // no two active contracts on the same home: periods must not overlap
        LocalDate debut = request.start_date();
        LocalDate fin = request.end_date();
        // colocation : un logement avec des chambres accepte plusieurs contrats, dans la limite de sa capacite
        // shared home: a home with rooms accepts several contracts, up to its capacity
        int capacite = logement.getPieces().stream().mapToInt(p -> Math.max(0, p.getCapacite())).sum();
        int chevauchements = 0;
        for (Contrat existant : contrat_repository.find_by_logement(logement.getId())) {
            boolean commence_avant_ma_fin = fin == null || !existant.getStart_date().isAfter(fin);
            boolean fini_apres_mon_debut = existant.getEnd_date() == null || !existant.getEnd_date().isBefore(debut);
            if (commence_avant_ma_fin && fini_apres_mon_debut) {
                chevauchements++;
                if (capacite == 0) {
                    throw new ConflitDonnees("Ce logement a déjà un contrat actif sur cette période (contrat n°"
                            + existant.getId() + ")");
                }
                if (existant.getLocataire().getId().equals(locataire.getId())) {
                    throw new ConflitDonnees("Ce locataire a déjà un contrat sur ce logement pour cette période");
                }
            }
        }
        if (capacite > 0 && chevauchements >= capacite) {
            throw new ConflitDonnees("Toutes les chambres de ce logement sont déjà sous contrat sur cette période");
        }

        Contrat contrat = new Contrat();
        contrat.setStart_date(debut);
        contrat.setEnd_date(fin);
        // edge case: loyer absent = loyer du logement / no rent = the home's rent
        contrat.setMonthly_rent(request.monthly_rent() == null ? logement.getRent() : request.monthly_rent());
        contrat.setDeposit(request.deposit() == null ? 0 : request.deposit());
        contrat.setLogement(logement);
        contrat.setBailleur(bailleur);
        contrat.setLocataire(locataire);
        Contrat cree = contrat_repository.save(contrat);

        logement.setStatus(ContratResponse.est_actif(cree) ? Statuts.loue : logement.getStatus());
        // le calendrier des loyers est cree tout de suite / the rent schedule is created right away
        service_loyer.generer_echeances(cree);
        service_notification.creer("LOCATAIRE", locataire.getId(), "INFO", "Nouveau contrat",
                "Votre contrat de location pour " + logement.getAddress() + " a été créé.", "CONTRAT", cree.getId());
        // PDF du contrat genere, puis envoye par e-mail au bailleur et au locataire apres validation
        service_document.creer_contrat(cree);
        service_audit.creation("CONTRAT", cree.getId(), "Contrat " + logement.getAddress() + " / " + locataire.getFirst_name() + " " + locataire.getLast_name());
        return ContratResponse.from(cree);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContratResponse> list(Boolean actif) {
        List<Contrat> contrats = utilisateur.bailleur()
                ? contrat_repository.find_by_bailleur(utilisateur.id())
                : contrat_repository.findAll();
        return contrats.stream()
                .filter(c -> actif == null || ContratResponse.est_actif(c) == actif)
                .map(ContratResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ContratResponse get(Long id) {
        return ContratResponse.from(visible(id));
    }

    @Override
    public void terminate(Long id) {
        Contrat contrat = visible(id);
        // seul le bailleur du contrat peut le resilier / only the contract's landlord can terminate
        if (!contrat.getBailleur().getId().equals(utilisateur.id())) {
            throw new RessourceIntrouvable("Contrat introuvable : " + id);
        }
        LocalDate today = LocalDate.now();
        if (contrat.getEnd_date() != null && contrat.getEnd_date().isBefore(today)) {
            throw new ConflitDonnees("Ce contrat est déjà terminé");
        }
        // le locataire doit avoir demande a partir avant que le bailleur puisse resilier / tenant must have asked to leave first
        if (!contrat.isResiliation_demandee()) {
            throw new RequeteInvalide("Le locataire n'a pas demandé la résiliation de ce contrat");
        }
        // edge case: contrat pas encore commence / contract not started yet
        contrat.setEnd_date(today.isBefore(contrat.getStart_date()) ? contrat.getStart_date() : today);
        contrat.getLogement().setStatus(Statuts.vacant);
        service_audit.modification("CONTRAT", id, "Contrat résilié : " + contrat.getLogement().getAddress());
    }

    @Override
    public FichierPdf generate_pdf(Long id) {
        return service_document.telecharger(DocumentPdf.contrat, id);
    }

    @Override
    public DocumentResponse document(Long id) {
        return service_document.statut(DocumentPdf.contrat, id);
    }

    @Override
    public DocumentResponse insert(Long id, String nom, byte[] contenu) {
        return service_document.inserer(DocumentPdf.contrat, id, nom, contenu);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> inserted() {
        return service_document.inseres(DocumentPdf.contrat);
    }

    @Override
    public DocumentResponse send(Long id) {
        return envoi_document.renvoyer(DocumentPdf.contrat, id);
    }

    // admin: tout ; bailleur: ses contrats ; locataire: son contrat. 404 sinon / else 404
    private Contrat visible(Long id) {
        Contrat contrat = contrat_repository.findById(id)
                .orElseThrow(() -> new RessourceIntrouvable("Contrat introuvable : " + id));
        boolean autorise = utilisateur.admin()
                || (utilisateur.bailleur() && contrat.getBailleur().getId().equals(utilisateur.id()))
                || (utilisateur.locataire() && contrat.getLocataire().getId().equals(utilisateur.id()));
        if (!autorise) {
            throw new RessourceIntrouvable("Contrat introuvable : " + id);
        }
        return contrat;
    }
}
