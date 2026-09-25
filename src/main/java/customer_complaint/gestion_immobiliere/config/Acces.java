package customer_complaint.gestion_immobiliere.config;

// regles d'acces reutilisees par @PreAuthorize / access rules reused by @PreAuthorize
public final class Acces {

    public static final String admin = "hasRole('ADMIN')";
    public static final String bailleur = "hasRole('BAILLEUR')";
    public static final String locataire = "hasRole('LOCATAIRE')";
    public static final String bailleur_ou_locataire = "hasAnyRole('BAILLEUR','LOCATAIRE')";
    public static final String staff = "hasAnyRole('ADMIN','BAILLEUR')";
    public static final String tous = "hasAnyRole('ADMIN','BAILLEUR','LOCATAIRE')";

    // le compte connecte = celui de l'URL (le role est verifie a part) / logged-in account = the one in the URL
    private static final String meme_id = "#id.toString() == authentication.principal.getClaim('uid').toString()";

    public static final String locataire_soi = "hasRole('LOCATAIRE') and " + meme_id;
    public static final String staff_ou_locataire_soi = "hasAnyRole('ADMIN','BAILLEUR') or (" + locataire_soi + ")";
    public static final String admin_ou_bailleur_soi = "hasRole('ADMIN') or (hasRole('BAILLEUR') and " + meme_id + ")";

    private Acces() {
    }
}
