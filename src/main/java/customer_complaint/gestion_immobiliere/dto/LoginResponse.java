package customer_complaint.gestion_immobiliere.dto;

// role: ADMIN, BAILLEUR ou LOCATAIRE ; expires_in en secondes / in seconds
// must_change_password: le front doit rediriger vers l'ecran de changement / front must redirect to the change screen
public record LoginResponse(String access_token, String refresh_token, String token_type, long expires_in,
                            Long id, String role, String email, String first_name, String last_name,
                            boolean must_change_password) {
}
