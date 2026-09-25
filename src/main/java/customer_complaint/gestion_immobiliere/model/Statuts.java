package customer_complaint.gestion_immobiliere.model;

// codes de statut partages avec le frontend / status codes shared with the frontend
public final class Statuts {

    public static final String nouveau = "NOUVEAU";
    public static final String en_cours = "EN_COURS";
    public static final String termine = "TERMINE";

    public static final String paye = "PAYE";
    public static final String en_attente = "EN_ATTENTE";
    public static final String en_retard = "EN_RETARD";

    // envoi des documents par e-mail / document e-mail delivery
    public static final String envoye = "ENVOYE";
    public static final String partiel = "PARTIEL";
    public static final String echec = "ECHEC";
    public static final String non_envoye = "NON_ENVOYE";

    // comptes, abonnements, factures / accounts, subscriptions, invoices
    public static final String actif = "ACTIF";
    public static final String suspendu = "SUSPENDU";
    public static final String resilie = "RESILIE";
    public static final String invite = "INVITE";
    public static final String payee = "PAYEE";

    public static final String loue = "LOUE";
    public static final String vacant = "VACANT";

    private Statuts() {
    }
}
