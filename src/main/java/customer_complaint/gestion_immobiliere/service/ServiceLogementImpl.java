package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.LogementRequest;
import customer_complaint.gestion_immobiliere.dto.LogementResponse;
import customer_complaint.gestion_immobiliere.dto.PieceRequest;
import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Bailleur;
import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Logement;
import customer_complaint.gestion_immobiliere.model.Piece;
import customer_complaint.gestion_immobiliere.repository.BailleurRepository;
import customer_complaint.gestion_immobiliere.repository.ContratRepository;
import customer_complaint.gestion_immobiliere.repository.LocataireRepository;
import customer_complaint.gestion_immobiliere.repository.LogementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceLogementImpl implements ServiceLogement {

    private final ServiceAudit service_audit;
    private final LogementRepository logement_repository;
    private final BailleurRepository bailleur_repository;
    private final ContratRepository contrat_repository;
    private final ServiceAbonnement service_abonnement;
    private final LocataireRepository locataire_repository;
    private final UtilisateurCourant utilisateur;
    private final AffectationPiece affectation;

    @Override
    public LogementResponse create(LogementRequest request) {
        // plan de l'abonnement : limite de logements / subscription plan: home limit
        service_abonnement.verifier_limite_logements(utilisateur.id());
        // le proprietaire est toujours le bailleur connecte / the owner is always the logged-in landlord
        Bailleur bailleur = bailleur_repository.findById(utilisateur.id())
                .orElseThrow(() -> new RessourceIntrouvable("Bailleur introuvable"));
        Logement logement = new Logement();
        logement.setBailleur(bailleur);
        appliquer(logement, request);
        Logement cree = logement_repository.save(logement);
        service_audit.creation("LOGEMENT", cree.getId(), "Logement " + cree.getAddress());
        return LogementResponse.from(cree, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LogementResponse> list() {
        List<Logement> logements = utilisateur.bailleur()
                ? logement_repository.find_by_bailleur(utilisateur.id())
                : logement_repository.findAll();
        Map<Long, Contrat> occupants = occupants(logements);
        return logements.stream().map(l -> LogementResponse.from(l, occupants.get(l.getId()))).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LogementResponse get(Long id) {
        Logement logement = trouver(id);
        boolean autorise = utilisateur.admin()
                || (utilisateur.bailleur() && logement.getBailleur().getId().equals(utilisateur.id()))
                || (utilisateur.locataire() && contrat_repository.locataire_lie_au_logement(utilisateur.id(), id));
        // 404 et non 403 : on ne revele pas l'existence du logement d'un autre / 404 not 403: do not reveal existence
        if (!autorise) {
            throw introuvable(id);
        }
        return LogementResponse.from(logement, occupants(List.of(logement)).get(id));
    }

    @Override
    public LogementResponse update(Long id, LogementRequest request) {
        Logement logement = proprietaire(id);
        appliquer(logement, request);
        Logement maj = logement_repository.save(logement);
        service_audit.modification("LOGEMENT", id, "Logement " + maj.getAddress() + " modifié");
        return LogementResponse.from(maj, occupants(List.of(maj)).get(id));
    }

    @Override
    public void delete(Long id) {
        Logement logement = proprietaire(id);
        if (!logement.getContrats().isEmpty() || !logement.getSignalements().isEmpty()
                || locataire_repository.count_by_logement(id) > 0) {
            throw new ConflitDonnees(
                    "Impossible de supprimer un logement qui a des contrats, des signalements ou des locataires rattachés");
        }
        logement_repository.delete(logement);
        service_audit.suppression("LOGEMENT", id, "Logement " + logement.getAddress());
    }

    private void appliquer(Logement logement, LogementRequest request) {
        logement.setAddress(request.address());
        logement.setPostal_code(request.postal_code());
        logement.setCity(request.city());
        // edge case: pays absent = France / no country = France
        logement.setCountry(request.country() == null || request.country().isBlank() ? "France" : request.country());
        logement.setType(request.type());
        logement.setArea(request.area());
        logement.setRent(request.rent());
        logement.setCharges(request.charges() == null ? 0 : request.charges());
        // edge case: liste absente = pieces inchangees / no list = rooms unchanged
        if (request.pieces() != null) {
            synchroniser_pieces(logement, request.pieces());
        }
    }

    // ajoute / met a jour / retire les pieces ; une chambre occupee ne peut ni disparaitre ni etre reduite
    // add / update / remove rooms; an occupied room can neither disappear nor shrink below its occupants
    private void synchroniser_pieces(Logement logement, List<PieceRequest> demandees) {
        Set<String> vus = new HashSet<>();
        for (PieceRequest demande : demandees) {
            if (!vus.add(demande.numero().trim().toUpperCase())) {
                throw new RequeteInvalide("Deux pièces portent le même numéro : " + demande.numero().trim());
            }
        }
        logement.getPieces().removeIf(existante -> {
            boolean gardee = vus.contains(existante.getNumero().toUpperCase());
            if (!gardee && !existante.getOccupants().isEmpty()) {
                throw new ConflitDonnees("La pièce " + existante.getNumero()
                        + " est occupée : libérez-la avant de la supprimer");
            }
            return !gardee;
        });
        for (PieceRequest demande : demandees) {
            String numero = demande.numero().trim();
            Piece piece = logement.getPieces().stream().filter(p -> p.getNumero().equalsIgnoreCase(numero))
                    .findFirst().orElse(null);
            if (piece == null) {
                piece = new Piece();
                piece.setLogement(logement);
                logement.getPieces().add(piece);
            }
            boolean logeable = "CHAMBRE".equals(demande.type()) || "BUREAU".equals(demande.type());
            int capacite = demande.capacite() != null ? demande.capacite() : (logeable ? 1 : 0);
            if (capacite < piece.getOccupants().size()) {
                throw new ConflitDonnees("La pièce " + numero + " a déjà " + piece.getOccupants().size()
                        + " occupant(s) : capacité minimale " + piece.getOccupants().size());
            }
            piece.setNumero(numero);
            piece.setType(demande.type());
            piece.setCapacite(capacite);
        }
    }

    @Override
    public LogementResponse assigner(Long id, Long locataire_id, Long piece_id) {
        Logement logement = proprietaire(id);
        Locataire locataire = locataire_du_bailleur(locataire_id);
        if (locataire.getLogement() != null && !locataire.getLogement().getId().equals(id)
                && contrat_repository.find_by_locataire(locataire_id).stream()
                .anyMatch(customer_complaint.gestion_immobiliere.dto.ContratResponse::est_actif)) {
            throw new ConflitDonnees("Le locataire a un contrat en cours dans un autre logement");
        }
        affectation.affecter(locataire, logement, piece_id);
        locataire_repository.save(locataire);
        service_audit.modification("LOGEMENT", id, locataire.getFirst_name() + " " + locataire.getLast_name()
                + " assigné à la pièce " + locataire.getPiece().getNumero());
        return LogementResponse.from(logement, occupants(List.of(logement)).get(id));
    }

    @Override
    public LogementResponse liberer(Long id, Long locataire_id) {
        Logement logement = proprietaire(id);
        Locataire locataire = locataire_du_bailleur(locataire_id);
        if (locataire.getPiece() == null || !locataire.getPiece().getLogement().getId().equals(id)) {
            throw new RequeteInvalide("Ce locataire n'occupe aucune chambre de ce logement");
        }
        affectation.liberer(locataire);
        locataire_repository.save(locataire);
        service_audit.modification("LOGEMENT", id, "Chambre libérée par " + locataire.getFirst_name() + " " + locataire.getLast_name());
        return LogementResponse.from(logement, occupants(List.of(logement)).get(id));
    }

    private Locataire locataire_du_bailleur(Long locataire_id) {
        Locataire locataire = locataire_repository.findById(locataire_id)
                .orElseThrow(() -> new RessourceIntrouvable("Locataire introuvable : " + locataire_id));
        if (!locataire_repository.lie_au_bailleur(locataire_id, utilisateur.id())) {
            throw new RessourceIntrouvable("Locataire introuvable : " + locataire_id);
        }
        return locataire;
    }

    // un seul appel SQL pour tous les logements de la liste / one query for the whole list
    private Map<Long, Contrat> occupants(List<Logement> logements) {
        Map<Long, Contrat> occupants = new HashMap<>();
        if (logements.isEmpty()) {
            return occupants;
        }
        List<Long> ids = logements.stream().map(Logement::getId).toList();
        for (Contrat contrat : contrat_repository.find_actifs_by_logements(ids)) {
            occupants.put(contrat.getLogement().getId(), contrat);
        }
        return occupants;
    }

    private Logement proprietaire(Long id) {
        Logement logement = trouver(id);
        if (!logement.getBailleur().getId().equals(utilisateur.id())) {
            throw introuvable(id);
        }
        return logement;
    }

    private Logement trouver(Long id) {
        return logement_repository.findById(id).orElseThrow(() -> introuvable(id));
    }

    private RessourceIntrouvable introuvable(Long id) {
        return new RessourceIntrouvable("Logement introuvable : " + id);
    }
}
