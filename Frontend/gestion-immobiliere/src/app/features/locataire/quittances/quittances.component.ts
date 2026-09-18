import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../core/services/mock-data.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-quittances',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="padding:24px;background:#f5f5f5;min-height:100vh;">
      <div style="margin-bottom:24px;">
        <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:#000;">Mes Quittances</h1>
        <p style="margin:0;color:#757575;font-size:14px;">Reçus de paiement insérés par votre bailleur</p>
      </div>

      <div style="background:#fff;border:1px solid #e0e0e0;margin-bottom:24px;">
        <div style="padding:16px 20px;border-bottom:1px solid #e0e0e0;display:flex;align-items:center;justify-content:space-between;">
          <h2 style="margin:0;font-size:16px;font-weight:600;color:#000;">Liste des quittances</h2>
          <select [(ngModel)]="filterYear" (change)="applyFilters()" style="padding:8px 12px;border:1px solid #e0e0e0;font-size:13px;background:#fff;color:#000;">
            <option value="all">Toutes les années</option>
            <option value="2026">2026</option>
          </select>
        </div>

        @if (filteredQuittances.length > 0) {
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#fafafa;">
                <th style="padding:12px 20px;text-align:left;font-size:12px;color:#757575;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">Mois / Année</th>
                <th style="padding:12px 20px;text-align:left;font-size:12px;color:#757575;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">Montant</th>
                <th style="padding:12px 20px;text-align:left;font-size:12px;color:#757575;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">Date d'émission</th>
                <th style="padding:12px 20px;text-align:left;font-size:12px;color:#757575;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">Reçu</th>
                <th style="padding:12px 20px;text-align:left;font-size:12px;color:#757575;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (q of filteredQuittances; track q.id) {
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:14px 20px;font-size:14px;color:#000;font-weight:500;">{{ getMonthName(q.month) }} {{ q.year }}</td>
                  <td style="padding:14px 20px;font-size:14px;color:#000;">{{ formatMontant(q.amount) }} €</td>
                  <td style="padding:14px 20px;font-size:14px;color:#424242;">{{ q.paidAt ? formatDate(q.paidAt) : '—' }}</td>
                  <td style="padding:14px 20px;">
                    @if (q.quittancePdf) {
                      <span style="padding:4px 12px;background:#000;color:#fff;font-size:12px;font-weight:600;">Disponible</span>
                    } @else {
                      <span style="padding:4px 12px;background:#e0e0e0;color:#666;font-size:12px;font-weight:600;">Non disponible</span>
                    }
                  </td>
                  <td style="padding:14px 20px;">
                    @if (q.quittancePdf) {
                      <button (click)="telecharger(q)" style="padding:6px 16px;background:#fff;color:#000;border:1px solid #e0e0e0;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Télécharger
                      </button>
                    } @else {
                      <span style="font-size:12px;color:#999;">Reçu non inséré par le bailleur</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <div style="padding:60px 20px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" stroke-width="2" style="margin-bottom:16px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p style="margin:0 0 8px;font-size:16px;color:#616161;font-weight:500;">Aucune quittance disponible</p>
            <p style="margin:0;font-size:13px;color:#9e9e9e;">Les quittances apparaîtront ici après chaque paiement validé</p>
          </div>
        }
      </div>
    </div>
  `
})
export class QuittancesComponent implements OnInit {
  locataire: any = null;
  allQuittances: any[] = [];
  filteredQuittances: any[] = [];
  filterYear = 'all';
  months = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    this.locataire = this.mockDataService.resolveLocataireForUser(user);
    this.refresh();
  }

  refresh(): void {
    if (!this.locataire) return;
    this.allQuittances = this.mockDataService.getPaiementsForLocataire(this.locataire.id)
      .filter((p: any) => p.type === 'LOYER' && p.status === 'PAYE')
      .sort((a: any, b: any) => (b.year - a.year) || (b.month - a.month));
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredQuittances = this.allQuittances.filter(q =>
      this.filterYear === 'all' || String(q.year) === this.filterYear
    );
  }

  getMonthName(month: number): string {
    return this.months[month] || '';
  }

  telecharger(q: any): void {
    const name = q.quittancePdf ? q.quittancePdf.name : `Quittance_${this.getMonthName(q.month)}_${q.year}.pdf`;
    this.toastService.success('Téléchargement', `${name} en cours de téléchargement`);
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
