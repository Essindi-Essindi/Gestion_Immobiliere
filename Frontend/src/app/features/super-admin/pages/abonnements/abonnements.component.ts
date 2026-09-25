import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@core/services/toast.service';
import { AdminAbonnementsService } from '@core/services/admin-abonnements.service';
import { AdminUtilisateursService } from '@core/services/admin-utilisateurs.service';
import { AbonnementResponse, AdminBailleurResponse, FactureResponse, PlanResponse } from '@core/models/admin.model';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-abonnements',
  standalone: true,
  imports: [FormsModule, StateBlockComponent],
  templateUrl: './abonnements.component.html',
  styleUrl: './abonnements.component.scss'
})
export class AbonnementsComponent implements OnInit {
  plans = signal<PlanResponse[]>([]);
  plansLoading = signal(true);
  plansError = signal<string | null>(null);

  editTarget = signal<PlanResponse | null>(null);
  createMode = signal(false);
  editForm: { name: string; price: number; period_months: number; max_logements: number; highlighted: boolean; features: string } =
    { name: '', price: 0, period_months: 1, max_logements: 0, highlighted: false, features: '' };

  abonnements = signal<AbonnementResponse[]>([]);
  aboLoading = signal(true);
  aboError = signal<string | null>(null);
  aboStatusFilter = signal('Tous');
  aboMsg = signal('');

  bailleurs = signal<AdminBailleurResponse[]>([]);
  newAbo = { bailleurId: '', planId: '' };

  factures = signal<FactureResponse[]>([]);
  factLoading = signal(true);
  factError = signal<string | null>(null);
  factStatusFilter = signal('Tous');
  factMsg = signal('');
  simDate = new Date().toISOString().slice(0, 10);

  activeAbonnements = computed(() => this.abonnements().filter(a => a.status === 'ACTIF'));
  revenuMensuel = computed(() => {
    const planById = new Map(this.plans().map(p => [p.id, p]));
    return this.activeAbonnements().reduce((sum, a) => sum + (planById.get(a.plan_id)?.price ?? 0), 0);
  });

  constructor(
    private toast: ToastService,
    private adminAbonnements: AdminAbonnementsService,
    private adminUtilisateurs: AdminUtilisateursService
  ) {}

  ngOnInit(): void {
    this.loadPlans();
    this.loadAbonnements();
    this.loadFactures();
    this.loadBailleurs();
  }

  // Plans
  loadPlans(): void {
    this.plansLoading.set(true);
    this.plansError.set(null);
    this.adminAbonnements.plans().subscribe({
      next: (list) => {
        this.plans.set(list);
        this.plansLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.plansError.set(err.error?.message || 'Impossible de charger les plans.');
        this.plansLoading.set(false);
      }
    });
  }

  subscriberCount(plan: PlanResponse): number {
    return this.abonnements().filter(a => a.plan_id === plan.id && a.status === 'ACTIF').length;
  }

  openCreate(): void {
    this.createMode.set(true);
    this.editForm = { name: '', price: 0, period_months: 1, max_logements: 0, highlighted: false, features: '' };
    this.editTarget.set({ id: '', name: '', price: 0, period_months: 1, features: [], max_logements: 0, highlighted: false, suspended: false, subscribers: 0 });
  }

  openEdit(plan: PlanResponse): void {
    this.createMode.set(false);
    this.editForm = {
      name: plan.name, price: plan.price, period_months: plan.period_months,
      max_logements: plan.max_logements ?? 0, highlighted: plan.highlighted, features: plan.features.join(', ')
    };
    this.editTarget.set(plan);
  }

  closeEdit(): void {
    this.editTarget.set(null);
  }

  saveEdit(): void {
    const target = this.editTarget();
    if (!target) return;
    const data = {
      name: this.editForm.name,
      price: Number(this.editForm.price),
      period_months: Number(this.editForm.period_months),
      max_logements: Number(this.editForm.max_logements) || undefined,
      highlighted: this.editForm.highlighted,
      features: this.editForm.features.split(',').map(f => f.trim()).filter(Boolean)
    };
    const request = this.createMode() ? this.adminAbonnements.createPlan(data) : this.adminAbonnements.updatePlan(target.id, data);
    request.subscribe({
      next: () => {
        this.closeEdit();
        this.toast.success(this.createMode() ? 'Plan créé' : 'Plan modifié', `Le plan ${data.name} a été enregistré`);
        this.loadPlans();
      },
      error: (err: HttpErrorResponse) => this.toast.error('Erreur', err.error?.message || 'Enregistrement impossible')
    });
  }

  toggleSuspend(plan: PlanResponse): void {
    const action = !plan.suspended ? this.adminAbonnements.suspendPlan(plan.id) : this.adminAbonnements.activatePlan(plan.id);
    action.subscribe({
      next: () => {
        this.toast.success(!plan.suspended ? 'Plan suspendu' : 'Plan repris', `Le plan ${plan.name} a été mis à jour`);
        this.loadPlans();
      },
      error: (err: HttpErrorResponse) => this.toast.error('Erreur', err.error?.message || 'Action impossible')
    });
  }

  deletePlan(plan: PlanResponse): void {
    if (!confirm(`Supprimer le plan ${plan.name} ?`)) return;
    this.adminAbonnements.deletePlan(plan.id).subscribe({
      next: () => {
        this.toast.success('Plan supprimé', `Le plan ${plan.name} a été supprimé`);
        this.loadPlans();
      },
      error: (err: HttpErrorResponse) => this.toast.error('Erreur', err.error?.message || 'Suppression impossible')
    });
  }

  // Abonnements
  loadAbonnements(): void {
    this.aboLoading.set(true);
    this.aboError.set(null);
    const status = this.aboStatusFilter() === 'Tous' ? undefined : this.aboStatusFilter();
    this.adminAbonnements.abonnements(status).subscribe({
      next: (list) => {
        this.abonnements.set(list);
        this.aboLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.aboError.set(err.error?.message || 'Impossible de charger les abonnements.');
        this.aboLoading.set(false);
      }
    });
  }

  setAboFilter(status: string): void {
    this.aboStatusFilter.set(status);
    this.loadAbonnements();
  }

  loadBailleurs(): void {
    this.adminUtilisateurs.bailleurs('ACTIF').subscribe({ next: (list) => this.bailleurs.set(list), error: () => {} });
  }

  assignAbonnement(): void {
    this.aboMsg.set('');
    if (!this.newAbo.bailleurId || !this.newAbo.planId) {
      this.aboMsg.set('Choisissez un propriétaire et un plan.');
      return;
    }
    this.adminAbonnements.subscribe({ bailleur_id: this.newAbo.bailleurId, plan_id: this.newAbo.planId }).subscribe({
      next: () => {
        this.newAbo = { bailleurId: '', planId: '' };
        this.toast.success('Abonnement créé', 'Le propriétaire est désormais abonné.');
        this.loadAbonnements();
      },
      error: (err: HttpErrorResponse) => this.aboMsg.set(err.error?.message || 'Création impossible.')
    });
  }

  changePlanFor(abo: AbonnementResponse, planId: string): void {
    if (!planId || planId === abo.plan_id) return;
    this.adminAbonnements.changePlan(abo.id, { plan_id: planId }).subscribe({
      next: () => {
        this.toast.success('Plan changé', `Nouveau plan appliqué pour ${abo.bailleur_name}`);
        this.loadAbonnements();
      },
      error: (err: HttpErrorResponse) => this.toast.error('Erreur', err.error?.message || 'Changement impossible')
    });
  }

  toggleAboSuspend(abo: AbonnementResponse): void {
    const action = abo.status === 'ACTIF' ? this.adminAbonnements.suspendAbonnement(abo.id) : this.adminAbonnements.resumeAbonnement(abo.id);
    action.subscribe({
      next: () => this.loadAbonnements(),
      error: (err: HttpErrorResponse) => this.toast.error('Erreur', err.error?.message || 'Action impossible')
    });
  }

  terminateAbo(abo: AbonnementResponse): void {
    if (!confirm(`Résilier l'abonnement de ${abo.bailleur_name} ?`)) return;
    this.adminAbonnements.terminateAbonnement(abo.id).subscribe({
      next: () => {
        this.toast.success('Abonnement résilié', `${abo.bailleur_name} a été résilié`);
        this.loadAbonnements();
      },
      error: (err: HttpErrorResponse) => this.toast.error('Erreur', err.error?.message || 'Résiliation impossible')
    });
  }

  // Factures
  loadFactures(): void {
    this.factLoading.set(true);
    this.factError.set(null);
    const status = this.factStatusFilter() === 'Tous' ? undefined : this.factStatusFilter();
    this.adminAbonnements.factures(undefined, status).subscribe({
      next: (list) => {
        this.factures.set(list);
        this.factLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.factError.set(err.error?.message || 'Impossible de charger les factures.');
        this.factLoading.set(false);
      }
    });
  }

  setFactFilter(status: string): void {
    this.factStatusFilter.set(status);
    this.loadFactures();
  }

  setFactureStatus(facture: FactureResponse, status: 'PAYEE' | 'EN_ATTENTE' | 'ECHEC'): void {
    this.adminAbonnements.setFactureStatus(facture.id, { status }).subscribe({
      next: () => this.loadFactures(),
      error: (err: HttpErrorResponse) => this.toast.error('Erreur', err.error?.message || 'Mise à jour impossible')
    });
  }

  simulateFacturation(): void {
    this.factMsg.set('');
    this.adminAbonnements.simulateFacturation(this.simDate).subscribe({
      next: (res) => {
        this.factMsg.set(`${res.abonnements_factures} facture(s) générée(s), ${res.montant_encaisse} € au total.`);
        this.loadFactures();
      },
      error: (err: HttpErrorResponse) => this.factMsg.set(err.error?.message || 'Simulation impossible.')
    });
  }
}
