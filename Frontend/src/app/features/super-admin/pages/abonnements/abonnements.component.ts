import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

interface Plan {
  id: number;
  name: string;
  price: string;
  period: string;
  features: string[];
  subscribers: number;
  highlighted: boolean;
  suspended: boolean;
}

@Component({
  selector: 'app-abonnements',
  standalone: true,
  imports: [FormsModule],
templateUrl: './abonnements.component.html',
  styleUrl: './abonnements.component.scss'
})
export class AbonnementsComponent {
  editTarget = signal<Plan | null>(null);
  editForm: any = {};
  editFeaturesText = '';

  constructor(private toast: ToastService) {}

  openEdit(plan: Plan): void {
    this.editTarget.set(plan);
    this.editForm = { name: plan.name, price: plan.price, period: plan.period, subscribers: plan.subscribers, highlighted: plan.highlighted };
    this.editFeaturesText = plan.features.join('\n');
  }

  closeEdit(): void {
    this.editTarget.set(null);
  }

  saveEdit(): void {
    const target = this.editTarget();
    if (!target) return;
    const features = this.editFeaturesText.split('\n').map(f => f.trim()).filter(f => f.length > 0);
    this.plans.update(list =>
      list.map(p => p.id === target.id ? {
        ...p,
        name: this.editForm.name,
        price: this.editForm.price,
        period: this.editForm.period,
        subscribers: Number(this.editForm.subscribers) || 0,
        highlighted: !!this.editForm.highlighted,
        features
      } : p)
    );
    this.closeEdit();
    this.toast.success('Plan modifié', `Le plan ${this.editForm.name} a été mis à jour`);
  }

  toggleSuspend(plan: Plan): void {
    this.plans.update(list =>
      list.map(p => p.id === plan.id ? { ...p, suspended: !p.suspended } : p)
    );
    if (plan.suspended) {
      this.toast.success('Plan repris', `Le plan ${plan.name} est de nouveau actif`);
    } else {
      this.toast.success('Plan suspendu', `Le plan ${plan.name} a été suspendu`);
    }
  }

  plans = signal<Plan[]>([
    {
      id: 1,
      name: 'Basic',
      price: '19,99',
      period: '€/mois',
      features: [
        'Jusqu\'à 5 logements',
        'Gestion des locataires',
        'Contrats de base',
        'Support par email',
        'Rapports mensuels'
      ],
      subscribers: 68,
      highlighted: false,
      suspended: false
    },
    {
      id: 2,
      name: 'Premium',
      price: '49,99',
      period: '€/mois',
      features: [
        'Jusqu\'à 25 logements',
        'Gestion avancée des locataires',
        'Contrats et quittances',
        'Support prioritaire',
        'Rapports et statistiques',
        'Interventions et maintenance',
        'Notifications automatiques'
      ],
      subscribers: 52,
      highlighted: true,
      suspended: false
    },
    {
      id: 3,
      name: 'Enterprise',
      price: '99,99',
      period: '€/mois',
      features: [
        'Logements illimités',
        'Multi-utilisateurs',
        'Contrats avancés',
        'Support dédié 24/7',
        'Analytics avancés',
        'API et intégrations',
        'Personnalisation complète',
        'Formation incluse'
      ],
      subscribers: 22,
      highlighted: false,
      suspended: false
    }
  ]);
}
