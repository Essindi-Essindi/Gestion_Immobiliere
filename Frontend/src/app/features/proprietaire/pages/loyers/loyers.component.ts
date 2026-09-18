import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { MontantPipe } from '@shared/pipes';

@Component({
  selector: 'app-loyers',
  standalone: true,
  imports: [RouterModule, MontantPipe],
  templateUrl: './loyers.component.html'
})
export class LoyersComponent implements OnInit {
  paiements = signal<any[]>([]);
  filteredPaiements = signal<any[]>([]);
  filterMonth = '';
  filterStatus = '';

  totalReceived = computed(() => this.filteredPaiements().filter(p => p.status === 'PAYE').reduce((sum, p) => sum + p.amount, 0));
  pendingAmount = computed(() => this.filteredPaiements().filter(p => p.status !== 'PAYE').reduce((sum, p) => sum + p.amount, 0));

  groupedPaiements = computed(() => {
    const map = new Map<string, any>();
    for (const p of this.filteredPaiements()) {
      if (p.type !== 'LOYER') continue;
      if (!map.has(p.logementId)) {
        map.set(p.logementId, { logementId: p.logementId, address: p.logementAddress, items: [] });
      }
      map.get(p.logementId).items.push(p);
    }
    return Array.from(map.values());
  });

  arrears = computed(() => {
    const map = new Map<string, any>();
    for (const p of this.paiements()) {
      if (p.type !== 'LOYER') continue;
      if (p.status === 'PAYE') continue;
      if (!map.has(p.locataireId)) {
        map.set(p.locataireId, { locataireId: p.locataireId, locataireNom: p.locataireNom, logementAddress: p.logementAddress, months: [], total: 0 });
      }
      const entry = map.get(p.locataireId);
      entry.months.push(p);
      entry.total += p.amount;
    }
    return Array.from(map.values()).map(a => ({
      ...a,
      months: a.months.sort((x: any, y: any) => (y.year - x.year) || (y.month - x.month)),
      monthLabels: a.months
        .sort((x: any, y: any) => (y.year - x.year) || (y.month - x.month))
        .map((m: any) => this.getMonthName(m.month) + ' ' + m.year).join(', ')
    }));
  });

  constructor(private mockData: MockDataService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.paiements.set(this.mockData.getAll('paiements'));
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.paiements();
    if (this.filterMonth) result = result.filter(p => p.month === Number(this.filterMonth));
    if (this.filterStatus) result = result.filter(p => p.status === this.filterStatus);
    this.filteredPaiements.set(result);
  }

  onFilterMonth(event: Event): void {
    this.filterMonth = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
  onFilterStatus(event: Event): void {
    this.filterStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  changeStatus(paiement: any, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.mockData.setPaiementStatus(paiement.id, status);
    this.refresh();
    this.toast.success('Statut mis à jour', `${paiement.locataireNom} : ${this.getStatusLabel(status)}`);
  }

  sendRappel(paiement: any): void {
    this.mockData.sendRappel(paiement.id);
    this.refresh();
    this.toast.success('Rappel envoyé', `Un rappel de paiement a été envoyé à ${paiement.locataireNom}`);
  }

  remindAll(a: any): void {
    for (const m of a.months) {
      this.mockData.sendRappel(m.id);
    }
    this.refresh();
    this.toast.success('Rappels envoyés', `${a.months.length} rappel(s) envoyé(s) à ${a.locataireNom} (${a.monthLabels})`);
  }

  getMonthName(month: number): string {
    const months = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[month] || '';
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
