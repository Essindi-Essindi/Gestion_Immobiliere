package customer_complaint.gestion_immobiliere.controller;

import customer_complaint.gestion_immobiliere.service.FichierPdf;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

// reponse de telechargement d'un PDF / PDF download response
final class Telechargement {

    private Telechargement() {
    }

    static ResponseEntity<byte[]> pdf(FichierPdf fichier) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(fichier.file_name()).build().toString())
                .contentLength(fichier.contenu().length)
                .body(fichier.contenu());
    }
}
