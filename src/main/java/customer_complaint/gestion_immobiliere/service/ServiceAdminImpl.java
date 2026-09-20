package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.model.Admin;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceAdminImpl implements ServiceAdmin {

    @Override
    public Admin create(Admin admin) {
        return null;
    }

    @Override
    public List<Admin> list() {
        return null;
    }

    @Override
    public Admin get(Long id) {
        return null;
    }

    @Override
    public void delete(Long id) {
    }

    @Override
    public void manage_accounts() {
    }

    @Override
    public void view_activity() {
    }

    @Override
    public void manage_roles() {
    }
}
