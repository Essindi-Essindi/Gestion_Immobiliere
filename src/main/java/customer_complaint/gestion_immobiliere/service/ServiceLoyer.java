package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.ArrieresResponse;
import customer_complaint.gestion_immobiliere.dto.LoyerResponse;
import customer_complaint.gestion_immobiliere.dto.QuittanceResponse;
import customer_complaint.gestion_immobiliere.dto.StatutLoyerRequest;
import customer_complaint.gestion_immobiliere.model.Contrat;

import java.util.List;

public interface ServiceLoyer {

    // filtres optionnels / optional filters
    List<LoyerResponse> list(String period, String status, Long logement_id, Long locataire_id);

    LoyerResponse get(Long id);

    LoyerResponse changer_statut(Long id, StatutLoyerRequest request);

    LoyerResponse rappel(Long id);

    QuittanceResponse creer_quittance(Long id);

    List<ArrieresResponse> arrieres();

    // cree les mois manquants d'un contrat / creates the missing months of one contract
    void generer_echeances(Contrat contrat);

    // idem pour tous les contrats d'un bailleur (mois qui viennent de commencer) / same for all of a landlord's contracts
    void synchroniser(Long bailleur_id);

    // idem pour les contrats d un locataire (il voit ses loyers meme si son bailleur n a rien ouvert) / same for a tenant contracts
    void synchroniser_locataire(Long locataire_id);
}
