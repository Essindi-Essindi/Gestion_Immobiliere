package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.DocumentResponse;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.DocumentPdf;
import customer_complaint.gestion_immobiliere.model.Quittance;
import customer_complaint.gestion_immobiliere.model.Statuts;
import customer_complaint.gestion_immobiliere.repository.ContratRepository;
import customer_complaint.gestion_immobiliere.repository.DocumentPdfRepository;
import customer_complaint.gestion_immobiliere.repository.QuittanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.HexFormat;
import java.util.Locale;

// le document est ENREGISTRE dans la transaction du contrat/de la quittance ; l'envoi par e-mail est un evenement
// apres validation : si l'e-mail echoue, le document existe deja et reste telechargeable
// the document is SAVED in the contract/receipt transaction; emailing is a post-commit event: if it fails, the document exists
@Service
@Transactional
@RequiredArgsConstructor
public class ServiceDocument {

    // tout ce qu'il faut pour envoyer, sans entite JPA (l'envoi se fait hors transaction)
    // everything needed to send, without JPA entities (sending happens outside a transaction)
    public record EnvoiPrepare(Long document_id, String file_name, byte[] contenu, String sujet, String description,
                               String bailleur_email, String bailleur_nom, String locataire_email,
                               String locataire_nom, boolean sent_bailleur, boolean sent_locataire) {
    }

    private record Source(Contrat contrat, Quittance quittance) {
    }

    private final ServiceAudit service_audit;
    private final DocumentPdfRepository document_repository;
    private final ContratRepository contrat_repository;
    private final QuittanceRepository quittance_repository;
    private final GenerateurPdf generateur;
    private final ApplicationEventPublisher publisher;
    private final ServiceNotification service_notification;
    private final UtilisateurCourant utilisateur;

    // appele par les services metier au moment de la creation / called by the business services on creation
    public void creer_contrat(Contrat contrat) {
        DocumentPdf document = enregistrer(DocumentPdf.contrat, new Source(contrat, null), Statuts.en_attente);
        publisher.publishEvent(new DocumentGenere(document.getId()));
    }

    public void creer_quittance(Quittance quittance) {
        DocumentPdf document = enregistrer(DocumentPdf.quittance, new Source(quittance.getContrat(), quittance),
                Statuts.en_attente);
        // un seul point pour les 3 chemins de creation d'une quittance / a single point for all 3 receipt creation paths
        service_audit.creation("QUITTANCE", quittance.getId(), "Quittance " + quittance.getPeriod() + " - "
                + quittance.getContrat().getLogement().getAddress());
        publisher.publishEvent(new DocumentGenere(document.getId()));
    }

    // seuls le bailleur et le locataire du contrat peuvent telecharger ; 404 pour tout autre (admin compris)
    // only the contract's landlord and tenant can download; 404 for anyone else (admin included)
    public FichierPdf telecharger(String type, Long ref_id) {
        Source source = source(type, ref_id);
        if (!proprietaire(source.contrat())) {
            throw introuvable(type, ref_id);
        }
        DocumentPdf document = existant_ou_genere(type, ref_id, source);
        return new FichierPdf(document.getFile_name(), document.getContent());
    }

    @Transactional(readOnly = false)
    public DocumentResponse statut(String type, Long ref_id) {
        Source source = source(type, ref_id);
        if (!bailleur_du(source.contrat())) {
            throw introuvable(type, ref_id);
        }
        return DocumentResponse.from(existant_ou_genere(type, ref_id, source));
    }

    // reserve au bailleur du contrat : c'est lui qui relance un envoi / landlord only: they retry a delivery
    public Long id_document_bailleur(String type, Long ref_id) {
        Source source = source(type, ref_id);
        if (!bailleur_du(source.contrat())) {
            throw introuvable(type, ref_id);
        }
        return existant_ou_genere(type, ref_id, source).getId();
    }

    @Transactional(readOnly = true)
    public EnvoiPrepare preparer_envoi(Long document_id) {
        DocumentPdf document = document_repository.findById(document_id)
                .orElseThrow(() -> new RessourceIntrouvable("Document introuvable : " + document_id));
        Source source = source(document.getType(), document.getRef_id());
        Contrat contrat = source.contrat();

        String sujet;
        String description;
        if (source.quittance() != null) {
            String mois = mois_lisible(source.quittance().getPeriod());
            sujet = "Quittance de loyer - " + mois;
            description = "la quittance de loyer de " + mois;
        } else {
            sujet = "Votre contrat de location";
            description = "le contrat de location n°" + contrat.getId() + " pour le logement "
                    + contrat.getLogement().getAddress();
        }
        return new EnvoiPrepare(document.getId(), document.getFile_name(), document.getContent(), sujet, description,
                contrat.getBailleur().getEmail(),
                contrat.getBailleur().getFirst_name() + " " + contrat.getBailleur().getLast_name(),
                contrat.getLocataire().getEmail(),
                contrat.getLocataire().getFirst_name() + " " + contrat.getLocataire().getLast_name(),
                document.isSent_bailleur(), document.isSent_locataire());
    }

    // le resultat de l'envoi n'a AUCUN effet sur le contenu du document / the delivery result never touches the document content
    public void enregistrer_resultat(Long document_id, boolean bailleur_ok, boolean locataire_ok, String erreur) {
        DocumentPdf document = document_repository.findById(document_id)
                .orElseThrow(() -> new RessourceIntrouvable("Document introuvable : " + document_id));
        document.setSent_bailleur(bailleur_ok);
        document.setSent_locataire(locataire_ok);
        document.setAttempts(document.getAttempts() + 1);

        boolean complet = bailleur_ok && locataire_ok;
        document.setEmail_status(complet ? Statuts.envoye : (bailleur_ok || locataire_ok ? Statuts.partiel : Statuts.echec));
        document.setLast_error(complet || erreur == null || erreur.isBlank() ? null : tronquer(erreur, 600));
        if (complet) {
            document.setSent_at(LocalDateTime.now());
            return;
        }

        // le bailleur est prevenu dans l'application : le PDF, lui, est bien la / the landlord is told in-app: the PDF is safe
        Source source = source(document.getType(), document.getRef_id());
        String objet = source.quittance() != null
                ? "la quittance de " + mois_lisible(source.quittance().getPeriod())
                : "le contrat n°" + source.contrat().getId();
        service_notification.creer("BAILLEUR", source.contrat().getBailleur().getId(), "WARNING",
                "Envoi par e-mail incomplet",
                "Le PDF de " + objet + " a bien été généré et reste téléchargeable, mais son envoi par e-mail a échoué"
                        + " pour au moins un destinataire. Vous pouvez relancer l'envoi.",
                document.getType(), document.getRef_id());
    }

    private DocumentPdf enregistrer(String type, Source source, String statut) {
        byte[] contenu = source.quittance() != null ? generateur.quittance(source.quittance())
                : generateur.contrat(source.contrat());
        DocumentPdf document = new DocumentPdf();
        document.setType(type);
        document.setRef_id(source.quittance() != null ? source.quittance().getId() : source.contrat().getId());
        document.setFile_name(nom_fichier(source));
        document.setContent(contenu);
        document.setSize_bytes(contenu.length);
        document.setSha256(HexFormat.of().formatHex(sha256(contenu)));
        document.setEmail_status(statut);
        return document_repository.save(document);
    }

    // document cree AVANT cette fonctionnalite : genere maintenant, sans e-mail / created before this feature: generated now, no email
    private DocumentPdf existant_ou_genere(String type, Long ref_id, Source source) {
        return document_repository.find_by_ref(type, ref_id)
                .orElseGet(() -> enregistrer(type, source, Statuts.non_envoye));
    }

    private Source source(String type, Long ref_id) {
        if (DocumentPdf.quittance.equals(type)) {
            Quittance quittance = quittance_repository.findById(ref_id).orElseThrow(() -> introuvable(type, ref_id));
            return new Source(quittance.getContrat(), quittance);
        }
        Contrat contrat = contrat_repository.findById(ref_id).orElseThrow(() -> introuvable(type, ref_id));
        return new Source(contrat, null);
    }

    private boolean proprietaire(Contrat contrat) {
        return bailleur_du(contrat)
                || (utilisateur.locataire() && contrat.getLocataire().getId().equals(utilisateur.id()));
    }

    private boolean bailleur_du(Contrat contrat) {
        return utilisateur.bailleur() && contrat.getBailleur().getId().equals(utilisateur.id());
    }

    private static String nom_fichier(Source source) {
        return source.quittance() != null
                ? "quittance-" + source.quittance().getPeriod() + "-contrat" + source.contrat().getId() + ".pdf"
                : "contrat-bail-" + source.contrat().getId() + ".pdf";
    }

    private static String mois_lisible(String period) {
        YearMonth mois = YearMonth.parse(period);
        return mois.getMonth().getDisplayName(TextStyle.FULL, Locale.FRENCH) + " " + mois.getYear();
    }

    private static RessourceIntrouvable introuvable(String type, Long ref_id) {
        return new RessourceIntrouvable((DocumentPdf.quittance.equals(type) ? "Quittance" : "Contrat")
                + " introuvable : " + ref_id);
    }

    private static byte[] sha256(byte[] contenu) {
        try {
            return java.security.MessageDigest.getInstance("SHA-256").digest(contenu);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String tronquer(String texte, int max) {
        return texte.length() <= max ? texte : texte.substring(0, max - 1) + "…";
    }
}
