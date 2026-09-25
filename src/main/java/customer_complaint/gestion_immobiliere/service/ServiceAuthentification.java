package customer_complaint.gestion_immobiliere.service;

import customer_complaint.gestion_immobiliere.dto.ChangePasswordRequest;
import customer_complaint.gestion_immobiliere.dto.LoginRequest;
import customer_complaint.gestion_immobiliere.dto.LoginResponse;
import customer_complaint.gestion_immobiliere.dto.RefreshRequest;

public interface ServiceAuthentification {

    LoginResponse log_in(LoginRequest request);

    LoginResponse refresh(RefreshRequest request);

    LoginResponse change_password(ChangePasswordRequest request);

    void log_out(RefreshRequest request);
}
