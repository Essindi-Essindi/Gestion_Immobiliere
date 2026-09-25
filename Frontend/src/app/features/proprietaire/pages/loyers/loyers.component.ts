import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoyerService } from '@core/services/loyer.service';
import { ToastService } from '@core/services/toast.service';
import { MontantPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';
import { ArrieresResponse, LoyerResponse, StatutLoyer } from '@core/models/loyer.model';

@Component({
  selector: 'app-loyers',
  standalone: true,
  imports: [RouterModule, FormsModule, MontantPipe, StateBlockComponent],
  templateUrl: './loyers.component.html'
})
export class LoyersComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);

  loyers = signal<LoyerResponse[]>([]);
  allLoyers = signal<LoyerResponse[]>([]);
  arrears = signal<ArrieresResponse[]>([]);
  filterPeriod = '';
  filterStatus: StatutLoyer | '' = '';

  totalReceived = computed(() => this.loyers().filter(l => l.status === 'PAYE').reduce((sum, l) => sum + l.amount, 0));
  pendingAmount = computed(() => this.loyers().filter(l => l.status !== 'PAYE').reduce((sum, l) => sum + l.amount, 0));

  groupedLoyers = computed(() => {
    const map = new Map<string, { logementId: string; address: string; items: LoyerResponse[] }>();
    for (const l of this.loyers()) {
      if (!map.has(l.logement_id)) {
        map.set(l.logement_id, { logementId: l.logement_id, address: l.logement_address, items: [] });
      }
      map.get(l.logement_id)!.items.push(l);
    }
    return Array.from(map.values());
  });

  constructor(private loyerService: LoyerService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    this.loyerService.getAll({
      period: this.filterPeriod || undefined,
      status: (this.filterStatus || undefined) as StatutLoyer | undefined
    }).subscribe({
      next: (data) => {
        this.loyers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les loyers');
        this.loading.set(false);
      }
    });
    // liste complete (sans filtre) pour pouvoir rappeler tous les mois impayes d'un locataire
    this.loyerService.getAll().subscribe({ next: (all) => this.allLoyers.set(all), error: () => {} });
    this.loyerService.arrears().subscribe({ next: (a) => this.arrears.set(a), error: () => {} });
  }

  onFilterPeriod(event: Event): void {
    this.filterPeriod = (event.target as HTMLInputElement).value;
    this.refresh();
  }
  onFilterStatus(event: Event): void {
    this.filterStatus = (event.target as HTMLSelectElement).value as StatutLoyer | '';
    this.refresh();
  }

  changeStatus(loyer: LoyerResponse, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as StatutLoyer;
    this.loyerService.setStatus(loyer.id, status).subscribe({
      next: () => {
        this.toast.success('Statut mis à jour', `${loyer.locataire_name} : ${this.getStatusLabel(status)}`);
        this.refresh();
      },
      error: () => this.toast.error('Erreur', 'Impossible de mettre à jour le statut')
    });
  }

  sendReminder(loyer: LoyerResponse): void {
    this.loyerService.reminder(loyer.id).subscribe({
      next: () => {
        this.toast.success('Rappel envoyé', `Un rappel de paiement a été envoyé à ${loyer.locataire_name}`);
        this.refresh();
      },
      error: () => this.toast.error('Erreur', "Impossible d'envoyer le rappel")
    });
  }

  remindAll(a: ArrieresResponse): void {
    const unpaid = this.allLoyers().filter(l => l.locataire_id === a.locataire_id && l.status !== 'PAYE' && !this.recent(l));
    if (unpaid.length === 0) return;
    unpaid.forEach(l => this.loyerService.reminder(l.id).subscribe());
    this.toast.success('Rappels envoyés', `${unpaid.length} rappel(s) envoyé(s) à ${a.locataire_name}`);
  }

  generateReceipt(loyer: LoyerResponse): void {
    this.loyerService.receipt(loyer.id).subscribe({
      next: () => this.toast.success('Quittance générée', `Quittance créée pour ${loyer.locataire_name} - voir la page Quittances`),
      error: () => this.toast.error('Erreur', 'Impossible de générer la quittance')
    });
  }

  // rappel deja envoye il y a moins de 24 h (meme regle que le backend) / reminder sent within 24h (same rule as backend)
  recent(loyer: LoyerResponse): boolean {
    return !!loyer.reminder_sent_at && Date.now() - new Date(loyer.reminder_sent_at).getTime() < 24 * 3600 * 1000;
  }

  monthlabel(period: string): string {
    const [y, m] = period.split("-");
    const names = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    return (names[Number(m) - 1] || period) + " " + y;
  }

  monthlabels(periods: string[]): string {
    return (periods || []).map(p => this.monthlabel(p)).join(", ");
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAYE': return 'Payé';
      case 'EN_ATTENTE': return 'En attente';
      case 'EN_RETARD': return 'En retard';
      default: return status;
    }
  }
  getStatusBg(status: string): string {
    switch (status) {
      case 'PAYE': return '#000';
      case 'EN_ATTENTE': return '#e0e0e0';
      case 'EN_RETARD': return '#fff';
      default: return '#fff';
    }
  }
  getStatusColor(status: string): string {
    switch (status) {
      case 'PAYE': return '#fff';
      case 'EN_ATTENTE': return '#333';
      case 'EN_RETARD': return '#000';
      default: return '#000';
    }
  }
}
