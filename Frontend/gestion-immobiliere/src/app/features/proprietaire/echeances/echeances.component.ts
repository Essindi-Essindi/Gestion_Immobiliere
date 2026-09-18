import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-echeances',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="padding: 24px; background: #f5f5f5; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="margin-bottom: 24px;">
        <h1 style="margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #000;">Échéances</h1>
        <p style="margin: 0; color: #666; font-size: 14px;">Calendrier des échéances à venir</p>
      </div>

      <!-- Legend -->
      <div style="display: flex; gap: 16px; margin-bottom: 20px; font-size: 13px; color: #666;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 12px; height: 12px; background: #000;"></div>
          <span>Urgent / En retard</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 12px; height: 12px; background: #888;"></div>
          <span>Bientôt</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 12px; height: 12px; background: #ccc;"></div>
          <span>À distance</span>
        </div>
      </div>

      <!-- Echeances Timeline -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        @for (echeance of echeances(); track echeance.id) {
          <div style="background: #fff; border: 1px solid #e0e0e0; display: flex; overflow: hidden;">
            <!-- Color Bar -->
            <div [style.background]="getEcheanceColor(echeance)" style="width: 6px; flex-shrink: 0;"></div>

            <!-- Date Block -->
            <div style="width: 100px; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 1px solid #e0e0e0; flex-shrink: 0;">
              <span style="font-size: 24px; font-weight: 700; color: #000; line-height: 1;">{{ formatJour(echeance.date) }}</span>
              <span style="font-size: 12px; color: #666; text-transform: uppercase;">{{ formatMoisCourt(echeance.date) }}</span>
              <span style="font-size: 11px; color: #999;">{{ formatAnnee(echeance.date) }}</span>
            </div>

            <!-- Content -->
            <div style="flex: 1; padding: 16px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span [style.background]="getTypeBg(echeance.type)"
                    [style.color]="getTypeColor(echeance.type)"
                    style="font-size: 10px; padding: 2px 6px; font-weight: 600; text-transform: uppercase;">
                    {{ echeance.type }}
                  </span>
                  @if (echeance.status === 'EN_RETARD') {
                    <span style="font-size: 10px; padding: 2px 6px; font-weight: 600; background: #000; color: #fff;">EN RETARD</span>
                  }
                </div>
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #000;">{{ echeance.description }}</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #666;">{{ echeance.logementAddress }}</p>
              </div>
              <div style="text-align: right; flex-shrink: 0; margin-left: 16px;">
                <span style="font-size: 12px; color: #999;">{{ getDaysUntil(echeance.date) }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      @if (echeances().length === 0) {
        <div style="background: #fff; border: 1px solid #e0e0e0; padding: 48px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">Aucune échéance à venir</p>
        </div>
      }
    </div>
  `
})
export class EcheancesComponent implements OnInit {
  echeances = signal<any[]>([]);

  constructor(private mockData: MockDataService, private authService: AuthService) {}

  ngOnInit(): void {
    const data = this.mockData.getAll('echeances');
    data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    this.echeances.set(data);
  }

  getEcheanceColor(echeance: any): string {
    if (echeance.status === 'EN_RETARD') return '#000';
    const days = this.getDaysUntilNum(echeance.date);
    if (days <= 30) return '#000';
    if (days <= 90) return '#888';
    return '#ccc';
  }

  getTypeBg(type: string): string {
    switch (type) {
      case 'LOYER': return '#000';
      case 'CONTRAT': return '#555';
      case 'MAINTENANCE': return '#e0e0e0';
      default: return '#f5f5f5';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'LOYER': return '#fff';
      case 'CONTRAT': return '#fff';
      case 'MAINTENANCE': return '#333';
      default: return '#666';
    }
  }

  getDaysUntil(date: Date): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)}j de retard`;
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Demain';
    return `Dans ${diffDays}j`;
  }

  getDaysUntilNum(date: Date): number {
    const now = new Date();
    const d = new Date(date);
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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