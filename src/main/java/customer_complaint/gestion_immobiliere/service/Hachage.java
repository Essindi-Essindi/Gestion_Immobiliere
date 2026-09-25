package customer_complaint.gestion_immobiliere.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

// jetons aleatoires + hash SHA-256 (on ne stocke jamais un jeton en clair) / random tokens + SHA-256 hash
public final class Hachage {

    private static final SecureRandom random = new SecureRandom();

    private Hachage() {
    }

    public static String jeton_aleatoire() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String sha256(String valeur) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(valeur.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
