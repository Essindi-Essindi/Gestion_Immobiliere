package customer_complaint.gestion_immobiliere.dto;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// politique de mot de passe / password policy (null = pas de changement, voir MotDePasseValidator)
@Documented
@Constraint(validatedBy = MotDePasseValidator.class)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface MotDePasseValide {

    String message() default "Mot de passe trop faible : 10 caractères minimum avec une minuscule, une majuscule, "
            + "un chiffre et un caractère spécial, sans espace ni mot courant";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
