package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.Admin;

import java.time.LocalDateTime;

public record AdminResponse(Long id, String last_name, String first_name, String email, String access_level,
                            LocalDateTime created_at, LocalDateTime updated_at) {

    public static AdminResponse from(Admin admin) {
        return new AdminResponse(admin.getId(), admin.getLast_name(), admin.getFirst_name(), admin.getEmail(),
                admin.getAccess_level(), admin.getCreated_at(), admin.getUpdated_at());
    }
}
