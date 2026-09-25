package customer_complaint.gestion_immobiliere.service;

// un PDF pret a etre telecharge / a PDF ready to download
public record FichierPdf(String file_name, byte[] contenu) {
}
