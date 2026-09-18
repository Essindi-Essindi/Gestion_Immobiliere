import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-loyers',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="padding: 24px; background: #f5f5f5; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="margin-bottom: 24px;">
        <h1 style="margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #000;">Loyers & Paiements</h1>
        <p style="margin: 0; color: #666; font-size: 14px;">Paiements classés par logement - changez le statut et envoyez des rappels</p>
      </div>

      <div style="background: #000; color: #fff; padding: 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <p style="margin: 0 0 4px; font-size: 14px; opacity: 0.7;">Total reçu (filtre actuel)</p>
          <p style="margin: 0; font-size: 32px; font-weight: 700;">{{ formatMontant(totalReceived()) }} FCFA</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0 0 4px; font-size: 14px; opacity: 0.7;">En attente / retard</p>
          <p style="margin: 0; font-size: 24px; font-weight: 600;">{{ formatMontant(pendingAmount()) }} FCFA</p>
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <select (change)="onFilterMonth($event)"
          style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; outline: none; background: #fff;">
          <option value="">Tous les mois</option>
          <option value="10">Octobre 2026</option>
          <option value="9">Septembre 2026</option>
          <option value="8">Août 2026</option>
        </select>
        <select (change)="onFilterStatus($event)"
          style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; outline: none; background: #fff;">
          <option value="">Tous les statuts</option>
          <option value="PAYE">Payé</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="EN_RETARD">En retard</option>
        </select>
      </div>

      @if (arrears().length > 0) {
        <div style="background: #fff; border: 1px solid #000; margin-bottom: 24px;">
          <div style="padding: 14px 20px; border-bottom: 1px solid #e0e0e0; background: #000;">
            <h2 style="margin: 0; font-size: 15px; font-weight: 700; color: #fff;">Mois impayés par locataire ({{ arrears().length }})</h2>
          </div>
          <div style="padding: 12px 20px; display: flex; flex-direction: column; gap: 10px;">
            @for (a of arrears(); track a.locataireId) {
              <div style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid #e0e0e0; flex-wrap: wrap;">
                <span style="font-size: 14px; font-weight: 700; color: #000;">{{ a.locataireNom }}</span>
                <span style="font-size: 11px; background: #000; color: #fff; padding: 3px 8px; font-weight: 700;">{{ a.months.length }} mois impayé(s)</span>
                <span style="font-size: 12px; color: #666;">{{ a.monthLabels }}</span>
                <span style="margin-left: auto; font-size: 14px; font-weight: 700; color: #000;">Total dû : {{ formatMontant(a.total) }} FCFA</span>
                <button (click)="remindAll(a)" title="Rappeler tous les impayés"
                  style="background: #000; color: #fff; border: none; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </button>
              </div>
            }
          </div>
        </div>
      }

      @for (group of groupedPaiements(); track group.logementId) {
        <div style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <h2 style="margin: 0; font-size: 17px; font-weight: 700; color: #000;">{{ group.address }}</h2>
            <span style="font-size: 11px; color: #666; background: #fff; border: 1px solid #e0e0e0; padding: 3px 8px;">{{ group.items.length }} paiement(s)</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            @for (paiement of group.items; track paiement.id) {
              <div style="background: #fff; border: 1px solid #e0e0e0; padding: 16px; display: flex; align-items: center; gap: 14px;">
                <div style="width: 44px; height: 44px; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0;">
                  {{ paiement.locataireNom.charAt(0) }}
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                    <span style="font-size: 14px; font-weight: 700; color: #000;">{{ paiement.locataireNom }}</span>
                    @if (paiement.roomNumber) {
                      <span style="font-size: 10px; background: #000; color: #fff; padding: 2px 6px; font-weight: 600;">{{ paiement.roomNumber }}</span>
                    }
                  </div>
                  <p style="margin: 0; font-size: 13px; color: #666;">{{ getMonthName(paiement.month) }} {{ paiement.year }} - <strong style="color: #000;">{{ formatMontant(paiement.amount) }} FCFA</strong></p>
                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                    <span [style.background]="getStatusBg(paiement.status)" [style.color]="getStatusColor(paiement.status)"
                      style="font-size: 11px; padding: 3px 8px; font-weight: 600;">
                      {{ getStatusLabel(paiement.status) }}
                    </span>
                    <select [value]="paiement.status" (change)="changeStatus(paiement, $event)"
                      style="font-size: 12px; padding: 4px 8px; border: 1px solid #e0e0e0; background: #fff; outline: none;">
                      <option value="PAYE">Payé</option>
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="EN_RETARD">En retard</option>
                    </select>
                  </div>
                </div>
                <div style="flex-shrink: 0;">
                  @if (paiement.status !== 'PAYE') {
                    <button (click)="sendRappel(paiement)" [disabled]="paiement.rappelSent" title="Envoyer un rappel"
                      [style.background]="paiement.rappelSent ? '#f5f5f5' : '#000'"
                      [style.color]="paiement.rappelSent ? '#999' : '#fff'"
                      style="border: none; width: 38px; height: 38px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </button>
                    @if (paiement.rappelSent) {
                      <p style="margin: 4px 0 0; font-size: 10px; color: #999; text-align: center;">Rappel envoyé</p>
                    }
                  } @else {
                    <span style="display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; background: #f5f5f5;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (groupedPaiements().length === 0) {
        <div style="background: #fff; border: 1px solid #e0e0e0; padding: 48px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">Aucun paiement trouvé</p>
        </div>
      }
    </div>
  `
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
  formatMontant(v: number | null | undefined): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v ?? 0));
  }
  formatDate(d: any): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  formatJour(d: any): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit' });
  }
  formatMoisCourt(d: any): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR', { month: 'short' });
  }
  formatAnnee(d: any): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric' });
  }
}
