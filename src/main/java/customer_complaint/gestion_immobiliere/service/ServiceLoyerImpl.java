package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.ArrieresResponse;
import customer_complaint.gestion_immobiliere.dto.LoyerResponse;
import customer_complaint.gestion_immobiliere.dto.QuittanceResponse;
import customer_complaint.gestion_immobiliere.dto.Regles;
import customer_complaint.gestion_immobiliere.dto.StatutLoyerRequest;
import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.exception.RequeteInvalide;
import customer_complaint.gestion_immobiliere.exception.RessourceIntrouvable;
import customer_complaint.gestion_immobiliere.model.Contrat;
import customer_complaint.gestion_immobiliere.model.Loyer;
import customer_complaint.gestion_immobiliere.model.Quittance;
import customer_complaint.gestion_immobiliere.model.Statuts;
import customer_complaint.gestion_immobiliere.repository.ContratRepository;
import customer_complaint.gestion_immobiliere.repository.LoyerRepository;
import customer_complaint.gestion_immobiliere.repository.QuittanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ServiceLoyerImpl implements ServiceLoyer {

    private final LoyerRepository loyer_repository;
    private final ContratRepository contrat_repository;
    private final QuittanceRepository quittance_repository;
    private final UtilisateurCourant utilisateur;
    private final EnvoiEmail envoi_email;
    private final ServiceNotification service_notification;
    private final ServiceDocument service_document;
    private final ServiceAudit service_audit;

    @Override
    public List<LoyerResponse> list(String period, String status, Long logement_id, Long locataire_id) {
        if (period != null && !period.matches(Regles.period)) {
            throw new RequeteInvalide("La période doit avoir le format AAAA-MM");
        }
        if (status != null && !List.of(Statuts.paye, Statuts.en_attente, Statuts.en_retard).contains(status)) {
            throw new RequeteInvalide("Le statut doit valoir PAYE, EN_ATTENTE ou EN_RETARD");
        }
        synchroniser(utilisateur.id());
        return loyer_repository.find_by_bailleur(utilisateur.id()).stream()
                .filter(l -> period == null || l.getPeriod().equals(period))
                .filter(l -> status == null || LoyerResponse.statut(l).equals(status))
                .filter(l -> logement_id == null || l.getContrat().getLogement().getId().equals(logement_id))
                .filter(l -> locataire_id == null || l.getContrat().getLocataire().getId().equals(locataire_id))
                .map(LoyerResponse::from)
                .toList();
    }

    @Override
    public LoyerResponse get(Long id) {
        return LoyerResponse.from(mien(id));
    }

    @Override
    public LoyerResponse changer_statut(Long id, StatutLoyerRequest request) {
        Loyer loyer = mien(id);
        if (Statuts.paye.equals(request.status())) {
            boolean deja_paye = loyer.getPaid_date() != null;
            loyer.setPaid_date(request.paid_date() != null ? request.paid_date() : LocalDate.now());
            // le locataire est prevenu une seule fois, quand le loyer passe a PAYE / tenant notified once, when it becomes PAID
            if (!deja_paye) {
                service_notification.creer("LOCATAIRE", loyer.getContrat().getLocataire().getId(), "SUCCESS",
                        "Paiement enregistré", "Votre loyer de " + loyer.getPeriod() + " (" + loyer.getAmount()
                                + " EUR) a été enregistré comme payé.", "LOYER", loyer.getId());
            }
        } else {
            // EN_ATTENTE / EN_RETARD : le paiement est annule, le retard se deduit de l'echeance
            loyer.setPaid_date(null);
        }
        service_audit.modification("LOYER", id, "Loyer " + loyer.getPeriod() + " → " + request.status());
        return LoyerResponse.from(loyer_repository.save(loyer));
    }

    @Override
    public LoyerResponse rappel(Long id) {
        Loyer loyer = mien(id);
        if (loyer.getPaid_date() != null) {
            throw new ConflitDonnees("Ce loyer est déjà payé");
        }
        // anti-spam : un rappel par 24 h et par loyer / anti-spam: one reminder per 24h per rent
        LocalDateTime dernier = loyer.getReminder_sent_at();
        if (dernier != null && dernier.isAfter(LocalDateTime.now().minus(Duration.ofHours(24)))) {
            throw new ConflitDonnees("Un rappel a déjà été envoyé dans les dernières 24 heures");
        }
        loyer.setReminder_sent_at(LocalDateTime.now());
        Contrat contrat = loyer.getContrat();
        envoi_email.envoyer_rappel_loyer(contrat.getLocataire().getEmail(), loyer.getPeriod(), loyer.getAmount(),
                contrat.getLogement().getAddress(),
                contrat.getBailleur().getFirst_name() + " " + contrat.getBailleur().getLast_name());
        service_notification.creer("LOCATAIRE", contrat.getLocataire().getId(), "WARNING", "Rappel de paiement",
                "Votre loyer de " + loyer.getPeriod() + " (" + loyer.getAmount() + " FCFA) n'a pas encore été réglé.",
                "LOYER", loyer.getId());
        return LoyerResponse.from(loyer_repository.save(loyer));
    }

    @Override
    public QuittanceResponse creer_quittance(Long id) {
        Loyer loyer = mien(id);
        if (loyer.getPaid_date() == null) {
            throw new RequeteInvalide("Une quittance ne peut être émise que pour un loyer payé");
        }
        if (quittance_repository.existe_pour_periode(loyer.getContrat().getId(), loyer.getPeriod())) {
            throw new ConflitDonnees("Une quittance existe déjà pour la période " + loyer.getPeriod());
        }
        Quittance quittance = new Quittance();
        quittance.setPeriod(loyer.getPeriod());
        quittance.setAmount(loyer.getAmount());
        quittance.setIssue_date(LocalDate.now());
        quittance.setContrat(loyer.getContrat());
        Quittance creee = quittance_repository.save(quittance);
        service_document.creer_quittance(creee);
        service_notification.creer("LOCATAIRE", loyer.getContrat().getLocataire().getId(), "INFO",
                "Quittance disponible", "Votre quittance de loyer de " + loyer.getPeriod() + " est disponible.",
                "QUITTANCE", creee.getId());
        return QuittanceResponse.from(creee);
    }

    @Override
    public List<ArrieresResponse> arrieres() {
        synchroniser(utilisateur.id());
        Map<Long, List<Loyer>> par_locataire = new LinkedHashMap<>();
        for (Loyer loyer : loyer_repository.find_by_bailleur(utilisateur.id())) {
            if (Statuts.en_retard.equals(LoyerResponse.statut(loyer))) {
                par_locataire.computeIfAbsent(loyer.getContrat().getLocataire().getId(), k -> new ArrayList<>()).add(loyer);
            }
        }
        return par_locataire.values().stream().map(loyers -> {
            Loyer premier = loyers.get(0);
            List<String> periodes = loyers.stream().map(Loyer::getPeriod).sorted(Comparator.reverseOrder()).toList();
            LocalDate plus_ancienne = loyers.stream().map(Loyer::getDue_date).min(Comparator.naturalOrder()).orElseThrow();
            return new ArrieresResponse(premier.getContrat().getLocataire().getId(),
                    premier.getContrat().getLocataire().getFirst_name() + " " + premier.getContrat().getLocataire().getLast_name(),
                    premier.getContrat().getLogement().getAddress(), periodes, periodes.size(),
                    loyers.stream().mapToDouble(Loyer::getAmount).sum(), plus_ancienne);
        }).sorted(Comparator.comparingDouble(ArrieresResponse::total_du).reversed()).toList();
    }

    @Override
    public void generer_echeances(Contrat contrat) {
        Set<String> existants = loyer_repository.find_by_contrat(contrat.getId()).stream()
                .map(Loyer::getPeriod).collect(Collectors.toSet());
        loyer_repository.saveAll(manquants(contrat, existants));
    }

    @Override
    public void synchroniser_locataire(Long locataire_id) {
        Map<Long, Set<String>> existants = new HashMap<>();
        for (Loyer loyer : loyer_repository.find_by_locataire(locataire_id)) {
            existants.computeIfAbsent(loyer.getContrat().getId(), k -> new java.util.HashSet<>()).add(loyer.getPeriod());
        }
        List<Loyer> nouveaux = new ArrayList<>();
        for (Contrat contrat : contrat_repository.find_by_locataire(locataire_id)) {
            nouveaux.addAll(manquants(contrat, existants.getOrDefault(contrat.getId(), Set.of())));
        }
        if (!nouveaux.isEmpty()) {
            loyer_repository.saveAll(nouveaux);
        }
    }

    @Override
    public void synchroniser(Long bailleur_id) {
        // une requete pour tous les loyers existants, pas une par contrat / one query for all existing rents
        Map<Long, Set<String>> existants = new HashMap<>();
        for (Loyer loyer : loyer_repository.find_by_bailleur(bailleur_id)) {
            existants.computeIfAbsent(loyer.getContrat().getId(), k -> new java.util.HashSet<>()).add(loyer.getPeriod());
        }
        List<Loyer> nouveaux = new ArrayList<>();
        for (Contrat contrat : contrat_repository.find_by_bailleur(bailleur_id)) {
            nouveaux.addAll(manquants(contrat, existants.getOrDefault(contrat.getId(), Set.of())));
        }
        if (!nouveaux.isEmpty()) {
            loyer_repository.saveAll(nouveaux);
        }
    }

    // un loyer par mois, du debut du contrat jusqu'au mois courant (ou la fin du contrat)
    // one rent per month, from the contract start up to the current month (or the contract end)
    private List<Loyer> manquants(Contrat contrat, Set<String> existants) {
        YearMonth debut = YearMonth.from(contrat.getStart_date());
        YearMonth maintenant = YearMonth.now();
        YearMonth fin = contrat.getEnd_date() == null || YearMonth.from(contrat.getEnd_date()).isAfter(maintenant)
                ? maintenant : YearMonth.from(contrat.getEnd_date());

        List<Loyer> nouveaux = new ArrayList<>();
        for (YearMonth mois = debut; !mois.isAfter(fin); mois = mois.plusMonths(1)) {
            if (existants.contains(mois.toString())) {
                continue;
            }
            Loyer loyer = new Loyer();
            loyer.setContrat(contrat);
            loyer.setPeriod(mois.toString());
            loyer.setAmount(contrat.getMonthly_rent());
            // echeance = jour anniversaire du contrat, ramene a la fin du mois si besoin (31 -> 28)
            loyer.setDue_date(mois.atDay(Math.min(contrat.getStart_date().getDayOfMonth(), mois.lengthOfMonth())));
            nouveaux.add(loyer);
        }
        return nouveaux;
    }

    // 404 si le loyer n'existe pas OU appartient a un autre bailleur / 404 if it does not exist OR belongs to another landlord
    private Loyer mien(Long id) {
        return loyer_repository.findById(id)
                .filter(l -> l.getContrat().getBailleur().getId().equals(utilisateur.id()))
                .orElseThrow(() -> new RessourceIntrouvable("Loyer introuvable : " + id));
    }
}
