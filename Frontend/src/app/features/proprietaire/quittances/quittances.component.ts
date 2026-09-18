import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-quittances',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="padding: 24px; background: #f5f5f5; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="margin-bottom: 24px;">
        <h1 style="margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #000;">Quittances</h1>
        <p style="margin: 0; color: #666; font-size: 14px;">Insérez les quittances PDF pour les loyers payés</p>
      </div>

      <div style="background: #fff; border: 1px solid #e0e0e0; padding: 16px 20px; margin-bottom: 20px; display: flex; gap: 20px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #000;">
          <span style="width: 12px; height: 12px; background: #000; display: inline-block;"></span>
          Payé + reçu ({{ countWithReceipt() }})
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #000;">
          <span style="width: 12px; height: 12px; background: #e0e0e0; border: 1px solid #999; display: inline-block;"></span>
          Payé sans reçu ({{ countPaidNoReceipt() }})
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #666;">
          <span style="width: 12px; height: 12px; background: #fff; border: 1px solid #e0e0e0; display: inline-block;"></span>
          Non payé ({{ countUnpaid() }})
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
      </div>

      @for (group of groupedQuittances(); track group.logementId) {
        <div style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <h2 style="margin: 0; font-size: 17px; font-weight: 700; color: #000;">{{ group.address }}</h2>
            <span style="font-size: 11px; color: #666; background: #fff; border: 1px solid #e0e0e0; padding: 3px 8px;">{{ group.items.length }} quittance(s)</span>
          </div>
          <p style="margin: 0 0 12px; font-size: 12px; color: #666;">Mois couverts : <strong style="color: #000;">{{ coveredMonths(group) }}</strong></p>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            @for (quittance of group.items; track quittance.id) {
              <div style="background: #fff; border: 1px solid #e0e0e0; padding: 14px 16px; display: flex; align-items: center; gap: 14px;"
                [style.border-left]="quittance.status === 'PAYE' ? (quittance.quittancePdf ? '4px solid #000' : '4px solid #999') : '4px solid #e0e0e0'">
                <div style="width: 40px; height: 40px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="14 2 14 9 20 9"/></svg>
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                    <span style="font-size: 14px; font-weight: 700; color: #000;">{{ quittance.locataireNom }}</span>
                    @if (quittance.roomNumber) {
                      <span style="font-size: 10px; background: #000; color: #fff; padding: 2px 6px; font-weight: 600;">{{ quittance.roomNumber }}</span>
                    }
                    <span style="font-size: 11px; color: #666;">{{ getMonthName(quittance.month) }} {{ quittance.year }}</span>
                  </div>
                  <p style="margin: 0; font-size: 13px; color: #666;">{{ formatMontant(quittance.amount) }} FCFA -
                    @if (quittance.status !== 'PAYE') {
                      <span style="color: #999;">Non payé</span>
                    } @else if (quittance.quittancePdf) {
                      <span style="color: #000; font-weight: 600;">Reçu disponible : {{ quittance.quittancePdf.name }}</span>
                    } @else {
                      <span style="color: #333; font-weight: 600;">Payé - reçu manquant</span>
                    }
                  </p>
                </div>
                <div style="flex-shrink: 0; display: flex; gap: 6px; align-items: center;">
                  @if (quittance.quittancePdf) {
                    <button (click)="openPdfView(quittance)" title="Voir le reçu"
                      style="background: #fff; color: #000; border: 1px solid #e0e0e0; padding: 6px 12px; font-size: 12px; cursor: pointer; font-weight: 600;">Voir</button>
                    <label title="Remplacer" style="background: #fff; color: #000; border: 1px solid #e0e0e0; padding: 6px 12px; font-size: 12px; cursor: pointer; font-weight: 600;">
                      Remplacer
                      <input type="file" accept=".pdf" (change)="onReplacePdf(quittance, $event)" style="display: none;"/>
                    </label>
                    <button (click)="removePdf(quittance)" title="Supprimer"
                      style="background: #fff; border: 1px solid #e0e0e0; padding: 6px 8px; cursor: pointer; display: flex;">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  } @else if (quittance.status === 'PAYE') {
                    <label style="display: flex; align-items: center; gap: 6px; background: #000; color: #fff; padding: 7px 14px; font-size: 12px; cursor: pointer; font-weight: 600;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                      Insérer quittance
                      <input type="file" accept=".pdf" (change)="onInsertPdf(quittance, $event)" style="display: none;"/>
                    </label>
                  } @else {
                    <span style="font-size: 12px; color: #999; padding: 6px 12px; border: 1px solid #e0e0e0;">En attente de paiement</span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (groupedQuittances().length === 0) {
        <div style="background: #fff; border: 1px solid #e0e0e0; padding: 48px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">Aucune quittance trouvée</p>
        </div>
      }

      @if (pdfView()) {
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;" (click)="pdfView.set(null)">
          <div style="background: #fff; width: 100%; max-width: 480px; padding: 24px;" (click)="$event.stopPropagation()">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #000;">Quittance PDF</h3>
              <button (click)="pdfView.set(null)" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #000; padding: 4px 8px;">✕</button>
            </div>
            <div style="background: #f5f5f5; border: 1px solid #e0e0e0; padding: 32px 16px; text-align: center; margin-bottom: 16px;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5" style="margin: 0 auto 8px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="14 2 14 9 20 9"/></svg>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #000;">{{ pdfView().quittancePdf.name }}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #666;">{{ pdfView().locataireNom }} - {{ getMonthName(pdfView().month) }} {{ pdfView().year }}</p>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button (click)="pdfView.set(null)" style="background: #fff; color: #000; border: 1px solid #e0e0e0; padding: 8px 16px; font-size: 13px; cursor: pointer;">Fermer</button>
              <button (click)="downloadPdf()" style="background: #000; color: #fff; border: none; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;">Télécharger</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class QuittancesComponent implements OnInit {
  quittances = signal<any[]>([]);
  filteredQuittances = signal<any[]>([]);
  filterMonth = '';
  pdfView = signal<any>(null);

  countWithReceipt = computed(() => this.filteredQuittances().filter(q => q.status === 'PAYE' && q.quittancePdf).length);
  countPaidNoReceipt = computed(() => this.filteredQuittances().filter(q => q.status === 'PAYE' && !q.quittancePdf).length);
  countUnpaid = computed(() => this.filteredQuittances().filter(q => q.status !== 'PAYE').length);

  groupedQuittances = computed(() => {
    const map = new Map<string, any>();
    for (const q of this.filteredQuittances()) {
      if (q.type !== 'LOYER') continue;
      if (!map.has(q.logementId)) {
        map.set(q.logementId, { logementId: q.logementId, address: q.logementAddress, items: [] });
      }
      map.get(q.logementId).items.push(q);
    }
    return Array.from(map.values());
  });

  constructor(private mockData: MockDataService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const paiements = this.mockData.getAll('paiements');
    this.quittances.set(paiements.filter((p: any) => p.type === 'LOYER'));
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.quittances();
    if (this.filterMonth) result = result.filter(q => q.month === Number(this.filterMonth));
    this.filteredQuittances.set(result);
  }

  onFilterMonth(event: Event): void {
    this.filterMonth = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  getMonthName(month: number): string {
    const months = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[month] || '';
  }

  coveredMonths(group: any): string {
    const seen = new Map<string, any>();
    for (const q of group.items) {
      seen.set(q.year + '-' + q.month, q);
    }
    return Array.from(seen.values())
      .sort((a: any, b: any) => (b.year - a.year) || (b.month - a.month))
      .map((q: any) => this.getMonthName(q.month) + ' ' + q.year)
      .join(', ') || '-';
  }

  onInsertPdf(quittance: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    this.mockData.setQuittancePdf(quittance.id, { name: file.name, date: new Date() });
    this.refresh();
    this.toast.success('Quittance insérée', `${file.name} ajouté pour ${quittance.locataireNom}`);
    input.value = '';
  }

  onReplacePdf(quittance: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    this.mockData.setQuittancePdf(quittance.id, { name: file.name, date: new Date() });
    this.refresh();
    this.toast.success('Quittance remplacée', `Nouveau document : ${file.name}`);
    input.value = '';
  }

  removePdf(quittance: any): void {
    this.mockData.removeQuittancePdf(quittance.id);
    this.refresh();
    this.toast.success('Reçu supprimé', 'La quittance PDF a été retirée');
  }

  openPdfView(quittance: any): void { this.pdfView.set(quittance); }

  downloadPdf(): void {
    this.toast.success('Téléchargement', `${this.pdfView().quittancePdf.name} téléchargé`);
    this.pdfView.set(null);
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
