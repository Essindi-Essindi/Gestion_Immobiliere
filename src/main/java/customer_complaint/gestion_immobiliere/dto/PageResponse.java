package customer_complaint.gestion_immobiliere.dto;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

// page de resultats, sans exposer les types internes de Spring Data / a result page without leaking Spring Data types
public record PageResponse<T>(List<T> content, int page, int size, long total_elements, int total_pages) {

    public static <E, T> PageResponse<T> from(Page<E> page, Function<E, T> conversion) {
        return new PageResponse<>(page.getContent().stream().map(conversion).toList(), page.getNumber(),
                page.getSize(), page.getTotalElements(), page.getTotalPages());
    }
}
