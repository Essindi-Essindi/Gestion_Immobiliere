package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.DocumentResponse;
import customer_complaint.gestion_immobiliere.dto.QuittanceRequest;
import customer_complaint.gestion_immobiliere.dto.QuittanceResponse;

import java.util.List;

public interface ServiceQuittance {

    QuittanceResponse create(QuittanceRequest request);

    List<QuittanceResponse> list();

    QuittanceResponse get(Long id);

    // bailleur ou locataire du contrat uniquement / the contract's landlord or tenant only
    FichierPdf generate_pdf(Long id);

    DocumentResponse document(Long id);

    // relance l'envoi aux destinataires qui n'ont rien recu / retries the delivery
    DocumentResponse send(Long id);
}
