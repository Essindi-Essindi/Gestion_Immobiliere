package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Admin;

import java.util.List;

public interface ServiceAdmin {

    Admin create(Admin admin);

    List<Admin> list();

    Admin get(Long id);

    void delete(Long id);

    void manage_accounts();

    void view_activity();

    void manage_roles();
}
