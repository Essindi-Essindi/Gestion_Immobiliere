package customer_complaint.gestion_immobiliere.service;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

// fenetre glissante en memoire (une seule instance du serveur) / in-memory sliding window (single server instance)
@Component
public class LimiteurDebit {

    private static final long conservation_ms = Duration.ofHours(1).toMillis();

    private final Map<String, Deque<Long>> passages = new ConcurrentHashMap<>();
    private final AtomicLong appels = new AtomicLong();

    // 0 = autorise ; sinon nombre de secondes a attendre / 0 = allowed; else seconds to wait
    public long essayer(String cle, int max, Duration fenetre) {
        long now = System.currentTimeMillis();
        long fenetre_ms = fenetre.toMillis();
        if (appels.incrementAndGet() % 500 == 0) {
            nettoyer(now);
        }

        Deque<Long> deque = passages.computeIfAbsent(cle, k -> new ArrayDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst() <= now - fenetre_ms) {
                deque.pollFirst();
            }
            if (deque.size() >= max) {
                return Math.max(1, (deque.peekFirst() + fenetre_ms - now + 999) / 1000);
            }
            deque.addLast(now);
            return 0;
        }
    }

    // evite que la map grossisse indefiniment / keeps the map from growing forever
    private void nettoyer(long now) {
        passages.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                return e.getValue().isEmpty() || e.getValue().peekLast() < now - conservation_ms;
            }
        });
    }
}
