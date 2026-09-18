import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

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
template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des abonnements</h1>
          <p>Plans disponibles et nombre d'abonnés par plan</p>
        </div>
      </div>

      <div class="plans-grid">
        @for (plan of plans(); track plan.id) {
          <div class="plan-card" [class.highlighted]="plan.highlighted" [class.suspended]="plan.suspended">
            @if (plan.highlighted && !plan.suspended) {
              <div class="plan-badge">Populaire</div>
            }
            @if (plan.suspended) {
              <div class="plan-badge suspended-badge">Suspendu</div>
            }
            <div class="plan-header">
              <h2>{{ plan.name }}</h2>
              <div class="plan-price">
                <span class="price">{{ plan.price }}</span>
                <span class="period">{{ plan.period }}</span>
              </div>
              <span class="plan-subscribers">{{ plan.subscribers }} abonnés</span>
            </div>
            <div class="plan-features">
              <p class="features-title">Fonctionnalités incluses</p>
              @for (feature of plan.features; track feature) {
                <div class="feature-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ feature }}</span>
                </div>
              }
            </div>
            <div class="plan-actions">
              <button class="btn-black" (click)="openEdit(plan)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
                Modifier
              </button>
              @if (plan.suspended) {
                <button class="btn-outline" (click)="toggleSuspend(plan)">Reprendre</button>
              } @else {
                <button class="btn-outline" (click)="toggleSuspend(plan)">Suspendre</button>
              }
            </div>
          </div>
        }
      </div>

      <div class="card summary-card">
        <div class="card-header">
          <h2>Résumé des abonnements</h2>
        </div>
        <div class="card-body">
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Revenu mensuel total</span>
              <span class="summary-value">4 723,45 €</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total abonnés</span>
              <span class="summary-value">142</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Taux de conversion</span>
              <span class="summary-value">68%</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Churn mensuel</span>
              <span class="summary-value">2.3%</span>
            </div>
          </div>
        </div>
      </div>

      @if (editTarget()) {
        <div class="modal-overlay" (click)="closeEdit()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Modifier le plan {{ editForm.name }}</h2>
              <button class="modal-close" (click)="closeEdit()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-grid">
                <div class="form-group">
                  <label>Nom du plan</label>
                  <input type="text" [(ngModel)]="editForm.name">
                </div>
                <div class="form-group">
                  <label>Prix</label>
                  <input type="text" [(ngModel)]="editForm.price">
                </div>
                <div class="form-group">
                  <label>Période</label>
                  <input type="text" [(ngModel)]="editForm.period">
                </div>
                <div class="form-group">
                  <label>Abonnés</label>
                  <input type="number" [(ngModel)]="editForm.subscribers">
                </div>
              </div>
              <div class="form-group">
                <label>Fonctionnalités (une par ligne)</label>
                <textarea [(ngModel)]="editFeaturesText" rows="6"></textarea>
              </div>
              <label class="check-row">
                <input type="checkbox" [(ngModel)]="editForm.highlighted">
                <span>Mettre en avant (Populaire)</span>
              </label>
            </div>
            <div class="modal-footer">
              <button class="btn-outline" (click)="closeEdit()">Annuler</button>
              <button class="btn-black" (click)="saveEdit()">Enregistrer</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; background: #f5f5f5; min-height: 100vh; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #000; font-family: inherit; }
    .page-header p { margin: 0; font-size: 14px; color: #666; font-family: inherit; }
    .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .plan-card { background: #fff; border: 1px solid #e0e0e0; display: flex; flex-direction: column; position: relative; }
    .plan-card.highlighted { border-color: #000; border-width: 2px; }
    .plan-card.suspended { opacity: 0.65; }
    .plan-badge { position: absolute; top: 0; right: 0; background: #000; color: #fff; font-size: 11px; font-weight: 600; padding: 4px 12px; }
    .suspended-badge { background: #666; }
    .plan-header { padding: 28px 24px 20px; border-bottom: 1px solid #e0e0e0; }
    .plan-header h2 { margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #000; font-family: inherit; }
    .plan-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px; }
    .price { font-size: 36px; font-weight: 700; color: #000; line-height: 1; }
    .period { font-size: 14px; color: #666; }
    .plan-subscribers { font-size: 13px; color: #666; font-weight: 500; }
    .plan-features { padding: 20px 24px; flex: 1; }
    .features-title { margin: 0 0 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
    .feature-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
    .feature-item svg { color: #000; flex-shrink: 0; }
    .feature-item span { font-size: 13px; color: #000; }
    .plan-actions { padding: 16px 24px; border-top: 1px solid #e0e0e0; display: flex; gap: 8px; }
    .btn-black { flex: 1; padding: 10px 16px; font-size: 13px; font-weight: 600; border: 1px solid #000; background: #000; color: #fff; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .btn-black:hover { background: #222; }
    .btn-outline { flex: 1; padding: 10px 16px; font-size: 13px; font-weight: 500; border: 1px solid #e0e0e0; background: #fff; color: #000; cursor: pointer; font-family: inherit; }
    .btn-outline:hover { background: #f5f5f5; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border: 1px solid #e0e0e0; width: 560px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
    .modal-header { padding: 16px 20px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; justify-content: space-between; }
    .modal-header h2 { margin: 0; font-size: 16px; font-weight: 700; color: #000; font-family: inherit; }
    .modal-close { border: none; background: none; cursor: pointer; padding: 4px; color: #666; }
    .modal-body { padding: 20px; }
    .modal-footer { padding: 16px 20px; border-top: 1px solid #e0e0e0; display: flex; justify-content: flex-end; gap: 8px; }
    .modal-footer .btn-black, .modal-footer .btn-outline { flex: none; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .form-group label { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; }
    .form-group input, .form-group textarea { padding: 10px 12px; border: 1px solid #e0e0e0; font-size: 14px; color: #000; font-family: inherit; outline: none; background: #fff; }
    .form-group input:focus, .form-group textarea:focus { border-color: #000; }
    .check-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #000; cursor: pointer; }
    .card { background: #fff; border: 1px solid #e0e0e0; }
    .card-header { padding: 16px 20px; border-bottom: 1px solid #e0e0e0; }
    .card-header h2 { margin: 0; font-size: 15px; font-weight: 600; color: #000; font-family: inherit; }
    .card-body { padding: 20px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .summary-item { display: flex; flex-direction: column; gap: 4px; padding: 16px; background: #fafafa; border: 1px solid #e0e0e0; }
    .summary-label { font-size: 12px; color: #666; font-weight: 500; }
    .summary-value { font-size: 24px; font-weight: 700; color: #000; }
    @media (max-width: 900px) { .plans-grid { grid-template-columns: 1fr; } .summary-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .summary-grid { grid-template-columns: 1fr; } }
  `]
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
