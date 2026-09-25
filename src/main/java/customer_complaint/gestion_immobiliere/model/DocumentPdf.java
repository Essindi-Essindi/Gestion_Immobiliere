package customer_complaint.gestion_immobiliere.model;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import org.hibernate.annotations.ColumnDefault;
import lombok.Setter;

import java.time.LocalDateTime;

// le PDF genere est CONSERVE en base : un echec d'e-mail ne le fait jamais disparaitre, et un document emis ne change plus
// the generated PDF is KEPT: an email failure never loses it, and an issued document never changes
@Entity
@Table(name = "document_pdf", uniqueConstraints = @UniqueConstraint(columnNames = {"type", "ref_id"}))
@Getter
@Setter
public class DocumentPdf extends Auditable {

    public static final String contrat = "CONTRAT";
    public static final String quittance = "QUITTANCE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // CONTRAT ou QUITTANCE ; ref_id = id du contrat ou de la quittance
    @Column(nullable = false, length = 10)
    private String type;

    @Column(nullable = false)
    private Long ref_id;

    @Column(nullable = false)
    private String file_name;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    // edge case: sans taille explicite MySQL cree un BLOB de 64 Ko, trop petit / no explicit size = 64 KB BLOB, too small
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] content;

    @Column(nullable = false)
    private long size_bytes;

    // empreinte pour verifier que le fichier n'a pas ete altere / fingerprint to detect tampering
    @Column(nullable = false, length = 64)
    private String sha256;

    // EN_ATTENTE, ENVOYE, PARTIEL (un seul destinataire), ECHEC, NON_ENVOYE (genere a la demande, sans e-mail)
    @Column(nullable = false, length = 12)
    private String email_status = Statuts.en_attente;

    // vrai quand le bailleur a insere son propre fichier / true when the landlord uploaded their own file
    @ColumnDefault("false")
    @Column(nullable = false)
    private boolean insere;

    private boolean sent_bailleur;
    private boolean sent_locataire;

    @Column(nullable = false)
    private int attempts;

    @Column(length = 600)
    private String last_error;

    private LocalDateTime sent_at;
}
