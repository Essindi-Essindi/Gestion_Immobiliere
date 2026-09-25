package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.ContratRequest;
import customer_complaint.gestion_immobiliere.dto.ContratResponse;
import customer_complaint.gestion_immobiliere.dto.DocumentResponse;

import java.util.List;

public interface ServiceContrat {

    ContratResponse create(ContratRequest request);

    // actif : null = tous, true = en cours, false = termines ou a venir / null = all, true = ongoing, false = ended or upcoming
    List<ContratResponse> list(Boolean actif);

    ContratResponse get(Long id);

    void terminate(Long id);

    // bailleur ou locataire du contrat uniquement / the contract's landlord or tenant only
    FichierPdf generate_pdf(Long id);

    // etat de l'envoi par e-mail du PDF (bailleur) / e-mail delivery state (landlord)
    DocumentResponse document(Long id);

    // relance l'envoi aux destinataires qui n'ont rien recu / retries the delivery
    DocumentResponse send(Long id);
}
