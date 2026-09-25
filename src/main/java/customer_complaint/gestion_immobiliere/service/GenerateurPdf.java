package customer_complaint.gestion_immobiliere.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import customer_complaint.gestion_immobiliere.model.Bailleur;
import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.Locataire;
import customer_complaint.gestion_immobiliere.model.Logement;
import customer_complaint.gestion_immobiliere.model.Quittance;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.Locale;

// fabrique les PDF du contrat de bail et de la quittance de loyer / builds the lease and rent receipt PDFs
@Component
public class GenerateurPdf {

    private static final DateTimeFormatter format_date = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Font titre = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
    private static final Font sous_titre = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
    private static final Font article = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Font texte = FontFactory.getFont(FontFactory.HELVETICA, 10.5f);
    private static final Font gras = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10.5f);
    private static final Font mention = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8.5f, Color.GRAY);

    public byte[] contrat(Contrat contrat) {
        Bailleur bailleur = contrat.getBailleur();
        Locataire locataire = contrat.getLocataire();
        Logement logement = contrat.getLogement();

        return construire("Contrat de location n°" + contrat.getId(), doc -> {
            doc.add(centre("CONTRAT DE LOCATION", titre));
            doc.add(centre("Contrat n° " + contrat.getId() + " - établi le " + format_date.format(LocalDate.now()),
                    sous_titre));

            doc.add(titre_article("Article 1 - Les parties"));
            PdfPTable parties = new PdfPTable(2);
            parties.setWidthPercentage(100);
            parties.addCell(bloc("LE BAILLEUR", nom(bailleur.getFirst_name(), bailleur.getLast_name()),
                    ligne("Adresse", bailleur.getAddress()), ligne("E-mail", bailleur.getEmail()),
                    ligne("Téléphone", bailleur.getPhone())));
            parties.addCell(bloc("LE LOCATAIRE", nom(locataire.getFirst_name(), locataire.getLast_name()),
                    ligne("Né(e) le", locataire.getBirth_date() == null ? null : format_date.format(locataire.getBirth_date())),
                    ligne("E-mail", locataire.getEmail()), ligne("Téléphone", locataire.getPhone())));
            doc.add(parties);

            doc.add(titre_article("Article 2 - Le logement loué"));
            doc.add(paragraphe("Adresse : " + logement.getAddress()
                    + (logement.getPostal_code() == null ? "" : ", " + logement.getPostal_code())
                    + (logement.getCity() == null ? "" : " " + logement.getCity()) + " (" + logement.getCountry() + ")"));
            doc.add(paragraphe("Type : " + logement.getType() + " - Surface : " + nombre(logement.getArea()) + " m²"));

            doc.add(titre_article("Article 3 - Durée du contrat"));
            doc.add(paragraphe("Le présent contrat prend effet le " + format_date.format(contrat.getStart_date())
                    + (contrat.getEnd_date() == null
                    ? " et est conclu pour une durée indéterminée."
                    : " et est conclu pour une durée déterminée jusqu'au " + format_date.format(contrat.getEnd_date()) + ".")));

            doc.add(titre_article("Article 4 - Loyer et charges"));
            int jour = contrat.getStart_date().getDayOfMonth();
            doc.add(paragraphe("Loyer mensuel : " + montant(contrat.getMonthly_rent())));
            doc.add(paragraphe("Provision mensuelle pour charges : " + montant(logement.getCharges())));
            doc.add(paragraphe("Le loyer est payable au plus tard le " + jour + " de chaque mois"
                    + (jour > 28 ? " (ou le dernier jour du mois lorsque celui-ci est plus court)." : ".")));

            doc.add(titre_article("Article 5 - Dépôt de garantie"));
            doc.add(paragraphe("Un dépôt de garantie de " + montant(contrat.getDeposit())
                    + " est versé à la signature. Il est restitué dans un délai maximal de deux mois après la remise "
                    + "des clés, déduction faite des sommes restant dues au bailleur."));

            doc.add(titre_article("Article 6 - Obligations du locataire"));
            doc.add(paragraphe("Le locataire s'engage à payer le loyer et les charges aux échéances convenues, à user "
                    + "paisiblement des locaux, à les entretenir, à s'assurer contre les risques locatifs et à signaler "
                    + "sans délai au bailleur tout problème affectant le logement."));

            doc.add(titre_article("Article 7 - Obligations du bailleur"));
            doc.add(paragraphe("Le bailleur s'engage à remettre au locataire un logement décent, à lui en assurer la "
                    + "jouissance paisible et à réaliser les réparations qui lui incombent."));

            doc.add(titre_article("Article 8 - Résiliation"));
            doc.add(paragraphe("Chaque partie peut mettre fin au contrat dans le respect du préavis et des règles "
                    + "prévus par la réglementation en vigueur."));

            doc.add(new Paragraph(" "));
            doc.add(paragraphe("Fait en deux exemplaires, à ____________________, le ____ / ____ / ________"));
            PdfPTable signatures = new PdfPTable(2);
            signatures.setWidthPercentage(100);
            signatures.addCell(signature("Le bailleur\n" + nom(bailleur.getFirst_name(), bailleur.getLast_name())));
            signatures.addCell(signature("Le locataire\n" + nom(locataire.getFirst_name(), locataire.getLast_name())));
            doc.add(signatures);

            doc.add(new Paragraph("Document généré par la plateforme de gestion locative. Modèle simplifié à titre "
                    + "informatif : à faire valider avant tout usage juridique.", mention));
        });
    }

    public byte[] quittance(Quittance quittance) {
        Contrat contrat = quittance.getContrat();
        Bailleur bailleur = contrat.getBailleur();
        Locataire locataire = contrat.getLocataire();
        Logement logement = contrat.getLogement();
        YearMonth periode = YearMonth.parse(quittance.getPeriod());
        String mois = periode.getMonth().getDisplayName(TextStyle.FULL, Locale.FRENCH) + " " + periode.getYear();

        return construire("Quittance de loyer - " + mois, doc -> {
            doc.add(centre("QUITTANCE DE LOYER", titre));
            doc.add(centre("Quittance n° " + quittance.getId() + " - émise le "
                    + format_date.format(quittance.getIssue_date()), sous_titre));

            doc.add(titre_article("Période"));
            doc.add(paragraphe(mois + " (du " + format_date.format(periode.atDay(1)) + " au "
                    + format_date.format(periode.atEndOfMonth()) + ")"));

            PdfPTable parties = new PdfPTable(2);
            parties.setWidthPercentage(100);
            parties.addCell(bloc("BAILLEUR", nom(bailleur.getFirst_name(), bailleur.getLast_name()),
                    ligne("Adresse", bailleur.getAddress()), ligne("E-mail", bailleur.getEmail())));
            parties.addCell(bloc("LOCATAIRE", nom(locataire.getFirst_name(), locataire.getLast_name()),
                    ligne("E-mail", locataire.getEmail())));
            doc.add(new Paragraph(" "));
            doc.add(parties);

            doc.add(titre_article("Logement"));
            doc.add(paragraphe(logement.getAddress()
                    + (logement.getPostal_code() == null ? "" : ", " + logement.getPostal_code())
                    + (logement.getCity() == null ? "" : " " + logement.getCity())));

            doc.add(titre_article("Montant"));
            PdfPTable total = new PdfPTable(2);
            total.setWidthPercentage(60);
            total.setHorizontalAlignment(Element.ALIGN_LEFT);
            total.addCell(cellule("Loyer de " + mois, gras));
            total.addCell(cellule(montant(quittance.getAmount()), gras));
            doc.add(total);

            doc.add(new Paragraph(" "));
            doc.add(paragraphe("Je soussigné(e) " + nom(bailleur.getFirst_name(), bailleur.getLast_name())
                    + ", propriétaire du logement désigné ci-dessus, déclare avoir reçu de "
                    + nom(locataire.getFirst_name(), locataire.getLast_name()) + " la somme de "
                    + montant(quittance.getAmount()) + " au titre du loyer de la période indiquée, et lui en donne "
                    + "quittance, sous réserve de tous mes droits."));
            doc.add(new Paragraph(" "));
            doc.add(paragraphe("Fait le " + format_date.format(quittance.getIssue_date())));
            PdfPTable signatures = new PdfPTable(2);
            signatures.setWidthPercentage(100);
            signatures.addCell(signature("Le bailleur\n" + nom(bailleur.getFirst_name(), bailleur.getLast_name())));
            signatures.addCell(cellule("", texte));
            doc.add(signatures);

            doc.add(new Paragraph("Cette quittance annule tous les reçus qui auraient pu être établis précédemment "
                    + "en cas de paiement partiel du montant du présent terme. Document généré par la plateforme "
                    + "de gestion locative.", mention));
        });
    }

    @FunctionalInterface
    private interface Contenu {
        void remplir(Document doc) throws DocumentException;
    }

    private byte[] construire(String titre_document, Contenu contenu) {
        ByteArrayOutputStream sortie = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 56, 56, 56, 56);
        try {
            PdfWriter.getInstance(document, sortie);
            document.addTitle(titre_document);
            document.addAuthor("Plateforme de gestion locative");
            document.addCreator("Gestion Immobiliere");
            document.open();
            contenu.remplir(document);
        } catch (DocumentException e) {
            throw new IllegalStateException("Génération du PDF impossible", e);
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }
        return sortie.toByteArray();
    }

    private static Paragraph centre(String valeur, Font police) {
        Paragraph paragraphe = new Paragraph(valeur, police);
        paragraphe.setAlignment(Element.ALIGN_CENTER);
        paragraphe.setSpacingAfter(8);
        return paragraphe;
    }

    private static Paragraph titre_article(String valeur) {
        Paragraph paragraphe = new Paragraph(valeur, article);
        paragraphe.setSpacingBefore(12);
        paragraphe.setSpacingAfter(4);
        return paragraphe;
    }

    private static Paragraph paragraphe(String valeur) {
        Paragraph paragraphe = new Paragraph(valeur, texte);
        paragraphe.setSpacingAfter(3);
        return paragraphe;
    }

    private static PdfPCell cellule(String valeur, Font police) {
        PdfPCell cellule = new PdfPCell(new Phrase(valeur, police));
        cellule.setPadding(6);
        cellule.setBorder(Rectangle.BOX);
        return cellule;
    }

    private static PdfPCell bloc(String entete, String nom, String... lignes) {
        Paragraph contenu = new Paragraph();
        contenu.add(new Phrase(entete + "\n", article));
        contenu.add(new Phrase(nom + "\n", gras));
        for (String ligne : lignes) {
            if (ligne != null) {
                contenu.add(new Phrase(ligne + "\n", texte));
            }
        }
        PdfPCell cellule = new PdfPCell(contenu);
        cellule.setPadding(8);
        return cellule;
    }

    private static PdfPCell signature(String legende) {
        PdfPCell cellule = new PdfPCell(new Phrase(legende, texte));
        cellule.setMinimumHeight(80);
        cellule.setPadding(8);
        return cellule;
    }

    private static String ligne(String libelle, String valeur) {
        return valeur == null || valeur.isBlank() ? null : libelle + " : " + valeur;
    }

    private static String nom(String prenom, String nom) {
        return prenom + " " + nom.toUpperCase(Locale.FRENCH);
    }

    // espace normal comme separateur de milliers : l'espace fine insecable du format francais n'existe pas dans la police PDF
    // plain space as thousands separator: the narrow no-break space of the French format is missing from the PDF font
    private static String nombre(double valeur) {
        DecimalFormatSymbols symboles = new DecimalFormatSymbols(Locale.FRANCE);
        symboles.setGroupingSeparator(' ');
        symboles.setDecimalSeparator(',');
        return new DecimalFormat("#,##0.00", symboles).format(valeur);
    }

    private static String montant(double valeur) {
        return nombre(valeur) + " €";
    }
}
