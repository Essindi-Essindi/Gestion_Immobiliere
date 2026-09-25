package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Bailleur;

import java.time.LocalDateTime;

public record BailleurResponse(Long id, String last_name, String first_name, String email, String phone,
                               String address, LocalDateTime created_at, LocalDateTime updated_at) {

    public static BailleurResponse from(Bailleur bailleur) {
        return new BailleurResponse(bailleur.getId(), bailleur.getLast_name(), bailleur.getFirst_name(),
                bailleur.getEmail(), bailleur.getPhone(), bailleur.getAddress(), bailleur.getCreated_at(),
                bailleur.getUpdated_at());
    }
}
