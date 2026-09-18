import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-contrat',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="padding:24px;background:#f5f5f5;min-height:100vh;">
      <div style="margin-bottom:24px;">
        <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:#000;">Mon Contrat</h1>
        <p style="margin:0;color:#757575;font-size:14px;">Détails de votre bail en cours</p>
      </div>

      @if (contrat) {
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:24px;">
          <div style="background:#fff;border:1px solid #e0e0e0;">
            <div style="padding:16px 20px;border-bottom:1px solid #e0e0e0;display:flex;align-items:center;justify-content:space-between;">
              <h2 style="margin:0;font-size:16px;font-weight:600;color:#000;">Détails du contrat</h2>
              <span style="padding:4px 12px;background:#000;color:#fff;font-size:12px;font-weight:600;">{{ contrat.status }}</span>
            </div>
            <div style="padding:20px;">
              <div style="margin-bottom:20px;display:flex;align-items:center;gap:12px;">
                <div>
                  <p style="margin:0 0 4px;font-size:12px;color:#757575;text-transform:uppercase;">Référence</p>
                  <p style="margin:0;font-size:18px;color:#000;font-weight:600;">CTR-{{ contrat.id }}</p>
                </div>
                @if (contrat.roomNumber) {
                  <span style="background:#000;color:#fff;font-size:12px;padding:4px 10px;font-weight:600;">Chambre {{ contrat.roomNumber }}</span>
                }
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div>
                  <p style="margin:0 0 4px;font-size:12px;color:#757575;text-transform:uppercase;">Locataire</p>
                  <p style="margin:0;font-size:14px;color:#000;font-weight:500;">{{ contrat.locataireNom }}</p>
                </div>
                <div>
                  <p style="margin:0 0 4px;font-size:12px;color:#757575;text-transform:uppercase;">Logement</p>
                  <p style="margin:0;font-size:14px;color:#000;font-weight:500;">{{ contrat.logementAddress }}</p>
                </div>
                <div>
                  <p style="margin:0 0 4px;font-size:12px;color:#757575;text-transform:uppercase;">Date de début</p>
                  <p style="margin:0;font-size:14px;color:#000;font-weight:500;">{{ formatDate(contrat.startDate) }}</p>
                </div>
                <div>
                  <p style="margin:0 0 4px;font-size:12px;color:#757575;text-transform:uppercase;">Date de fin</p>
                  <p style="margin:0;font-size:14px;color:#000;font-weight:500;">{{ formatDate(contrat.endDate) }}</p>
                </div>
                <div>
                  <p style="margin:0 0 4px;font-size:12px;color:#757575;text-transform:uppercase;">Loyer mensuel</p>
                  <p style="margin:0;font-size:14px;color:#000;font-weight:500;">{{ formatMontant(contrat.rent) }} €</p>
                </div>
                <div>
                  <p style="margin:0 0 4px;font-size:12px;color:#757575;text-transform:uppercase;">Charges</p>
                  <p style="margin:0;font-size:14px;color:#000;font-weight:500;">{{ formatMontant(contrat.charges) }} €</p>
                </div>
                <div>
                  <p style="margin:0 0 4px;font-size:12px;color:#757575;text-transform:uppercase;">Dépôt de garantie</p>
                  <p style="margin:0;font-size:14px;color:#000;font-weight:500;">{{ formatMontant(contrat.deposit) }} €</p>
                </div>
              </div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="background:#fff;border:1px solid #e0e0e0;">
              <div style="padding:16px 20px;border-bottom:1px solid #e0e0e0;">
                <h2 style="margin:0;font-size:16px;font-weight:600;color:#000;">Document du bailleur</h2>
              </div>
              <div style="padding:20px;display:flex;flex-direction:column;gap:12px;">
                @if (contrat.contractPdf) {
                  <div style="display:flex;align-items:center;gap:8px;background:#f5f5f5;border:1px solid #e0e0e0;padding:10px 12px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="14 2 14 9 20 9"/></svg>
                    <span style="flex:1;font-size:13px;color:#000;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ contrat.contractPdf.name }}</span>
                  </div>
                  <button (click)="telechargerContrat()" style="width:100%;padding:12px;background:#000;color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Télécharger le contrat
                  </button>
                } @else {
                  <p style="margin:0;font-size:13px;color:#999;background:#f5f5f5;border:1px solid #e0e0e0;padding:12px;">Document non disponible pour le moment. Votre bailleur ne l'a pas encore inséré.</p>
                }
                <a routerLink="/locataire/demandes" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:#fff;color:#000;border:1px solid #e0e0e0;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  Demande de résiliation
                </a>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div style="background:#fff;border:1px solid #e0e0e0;padding:48px;text-align:center;">
          <p style="margin:0;color:#666;font-size:14px;">Aucun contrat trouvé pour votre compte.</p>
        </div>
      }
    </div>
  `
})
export class ContratComponent implements OnInit {
  contrat: any = null;

  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    const loc = this.mockDataService.resolveLocataireForUser(user);
    this.contrat = loc ? this.mockDataService.getContratForLocataire(loc.id) : null;
  }

  telechargerContrat(): void {
    if (this.contrat?.contractPdf) {
      this.toastService.success('Téléchargement', `${this.contrat.contractPdf.name} téléchargé`);
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
