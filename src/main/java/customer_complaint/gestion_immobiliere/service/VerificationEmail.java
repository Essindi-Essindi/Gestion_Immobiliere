package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.exception.ConflitDonnees;
import customer_complaint.gestion_immobiliere.repository.AdminRepository;
import customer_complaint.gestion_immobiliere.repository.BailleurRepository;
import customer_complaint.gestion_immobiliere.repository.LocataireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

// un e-mail = un seul compte, tous roles confondus (sert au login) / one email = one account across roles (used by login)
@Component
@RequiredArgsConstructor
public class VerificationEmail {

    private final AdminRepository admin_repository;
    private final BailleurRepository bailleur_repository;
    private final LocataireRepository locataire_repository;

    public String normaliser(String email) {
        return email.trim().toLowerCase();
    }

    public void assurer_libre(String email) {
        if (admin_repository.existsByEmail(email) || bailleur_repository.existsByEmail(email)
                || locataire_repository.existsByEmail(email)) {
            throw new ConflitDonnees("Cette adresse e-mail est déjà utilisée");
        }
    }
}
