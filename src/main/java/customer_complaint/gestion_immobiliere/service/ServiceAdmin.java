package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.AdminRequest;
import customer_complaint.gestion_immobiliere.dto.AdminResponse;

import java.util.List;

public interface ServiceAdmin {

    AdminResponse create(AdminRequest request);

    List<AdminResponse> list();

    AdminResponse get(Long id);

    void delete(Long id);

    void manage_accounts();

    void view_activity();

    void manage_roles();
}
