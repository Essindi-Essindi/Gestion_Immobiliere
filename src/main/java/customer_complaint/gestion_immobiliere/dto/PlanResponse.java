package customer_complaint.gestion_immobiliere.dto;

import customer_complaint.gestion_immobiliere.model.PlanAbonnement;

import java.util.List;

// subscribers : abonnements non resilies ; suspended : plus de nouvelle souscription
public record PlanResponse(Long id, String name, double price, int period_months, List<String> features,
                           Integer max_logements, boolean highlighted, boolean suspended, long subscribers) {

    public static PlanResponse from(PlanAbonnement plan, long subscribers) {
        return new PlanResponse(plan.getId(), plan.getName(), plan.getPrice(), plan.getPeriod_months(),
                List.copyOf(plan.getFeatures()), plan.getMax_logements(), plan.isHighlighted(), plan.isSuspended(),
                subscribers);
    }
}
