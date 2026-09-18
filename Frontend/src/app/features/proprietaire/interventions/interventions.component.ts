import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-interventions',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="padding: 24px; background: #f5f5f5; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="margin-bottom: 24px;">
        <h1 style="margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #000;">Interventions & Problèmes</h1>
        <p style="margin: 0; color: #666; font-size: 14px;">Lisez les problèmes signalés et faites-les avancer</p>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <select (change)="onFilterStatus($event)"
          style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; outline: none; background: #fff;">
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Terminée</option>
        </select>
        <select (change)="onFilterCategory($event)"
          style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; outline: none; background: #fff;">
          <option value="">Toutes les catégories</option>
          <option value="PLOMBERIE">Plomberie</option>
          <option value="ELECTRICITE">Électricité</option>
          <option value="CHAUFFAGE">Chauffage</option>
          <option value="MENUISERIE">Menuiserie</option>
          <option value="PEINTURE">Peinture</option>
          <option value="SERRURERIE">Serrurerie</option>
          <option value="AUTRE">Autre</option>
        </select>
      </div>

      <div style="background: #fff; border: 1px solid #e0e0e0; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5; border-bottom: 1px solid #e0e0e0;">
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Logement</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Locataire</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Titre</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Catégorie</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Statut</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Date</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Coût</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (intervention of filteredInterventions(); track intervention.id) {
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 12px 16px; font-size: 13px; color: #333; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ intervention.logementAddress }}</td>
                <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #000;">{{ intervention.locataireNom }}</td>
                <td style="padding: 12px 16px; font-size: 14px; color: #000; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ intervention.title }}</td>
                <td style="padding: 12px 16px; font-size: 13px; color: #333;">{{ intervention.category }}</td>
                <td style="padding: 12px 16px;">
                  <span [style.background]="getStatusBg(intervention.status)"
                    [style.color]="getStatusColor(intervention.status)"
                    style="font-size: 11px; padding: 3px 8px; font-weight: 600;">
                    {{ getStatusLabel(intervention.status) }}
                  </span>
                </td>
                <td style="padding: 12px 16px; font-size: 13px; color: #333;">{{ formatDate(intervention.createdAt) }}</td>
                <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #000;">{{ formatMontant((intervention.actualCost || intervention.estimatedCost || 0)) }} FCFA</td>
                <td style="padding: 12px 16px;">
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <button (click)="openView(intervention)" title="Voir le problème"
                      style="background: #fff; border: 1px solid #e0e0e0; padding: 6px; cursor: pointer; display: flex;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    @if (intervention.status === 'EN_ATTENTE') {
                      <button (click)="markInProgress(intervention)"
                        style="background: #fff; color: #000; border: 1px solid #000; padding: 4px 10px; font-size: 11px; cursor: pointer; font-weight: 600;">En cours</button>
                    }
                    @if (intervention.status !== 'TERMINE') {
                      <button (click)="markComplete(intervention)"
                        style="background: #000; color: #fff; border: none; padding: 4px 10px; font-size: 11px; cursor: pointer; font-weight: 600;">Terminer</button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (filteredInterventions().length === 0) {
          <div style="padding: 32px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">Aucune intervention trouvée</p>
          </div>
        }
      </div>

      @if (viewTarget()) {
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;" (click)="viewTarget.set(null)">
          <div style="background: #fff; width: 100%; max-width: 560px; max-height: 85vh; overflow: auto;" (click)="$event.stopPropagation()">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e0e0e0;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #000;">{{ viewTarget().title }}</h3>
              <button (click)="viewTarget.set(null)" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #000; padding: 4px 8px;">✕</button>
            </div>
            <div style="padding: 20px;">
              <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                <span [style.background]="getStatusBg(viewTarget().status)" [style.color]="getStatusColor(viewTarget().status)"
                  style="font-size: 11px; padding: 3px 8px; font-weight: 600;">{{ getStatusLabel(viewTarget().status) }}</span>
                <span style="font-size: 11px; padding: 3px 8px; font-weight: 600; background: #f5f5f5; color: #333; border: 1px solid #e0e0e0;">{{ viewTarget().category }}</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div><p style="margin: 0 0 2px; font-size: 11px; color: #999; text-transform: uppercase;">Logement</p><p style="margin: 0; font-size: 14px; color: #000; font-weight: 500;">{{ viewTarget().logementAddress }}</p></div>
                <div><p style="margin: 0 0 2px; font-size: 11px; color: #999; text-transform: uppercase;">Signalé par</p><p style="margin: 0; font-size: 14px; color: #000; font-weight: 500;">{{ viewTarget().locataireNom }}</p></div>
                <div><p style="margin: 0 0 2px; font-size: 11px; color: #999; text-transform: uppercase;">Date</p><p style="margin: 0; font-size: 14px; color: #000; font-weight: 500;">{{ formatDate(viewTarget().createdAt) }}</p></div>
                <div><p style="margin: 0 0 2px; font-size: 11px; color: #999; text-transform: uppercase;">Coût estimé</p><p style="margin: 0; font-size: 14px; color: #000; font-weight: 500;">{{ formatMontant(viewTarget().estimatedCost) }} FCFA</p></div>
              </div>
              <p style="margin: 0 0 4px; font-size: 11px; color: #999; text-transform: uppercase;">Description du problème</p>
              <p style="margin: 0; font-size: 14px; color: #000; background: #f5f5f5; border: 1px solid #e0e0e0; padding: 12px;">{{ viewTarget().description || 'Aucune description fournie.' }}</p>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end; padding: 16px 20px; border-top: 1px solid #e0e0e0;">
              <button (click)="viewTarget.set(null)" style="background: #fff; color: #000; border: 1px solid #e0e0e0; padding: 8px 16px; font-size: 13px; cursor: pointer;">Fermer</button>
              @if (viewTarget().status === 'EN_ATTENTE') {
                <button (click)="markInProgress(viewTarget()); viewTarget.set(null)" style="background: #fff; color: #000; border: 1px solid #000; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;">Passer en cours</button>
              }
              @if (viewTarget().status !== 'TERMINE') {
                <button (click)="markComplete(viewTarget()); viewTarget.set(null)" style="background: #000; color: #fff; border: none; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;">Terminer</button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class InterventionsComponent implements OnInit {
  interventions = signal<any[]>([]);
  filteredInterventions = signal<any[]>([]);
  filterStatus = '';
  filterCategory = '';
  viewTarget = signal<any>(null);

  constructor(private mockData: MockDataService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.interventions.set(this.mockData.getAll('interventions'));
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.interventions();
    if (this.filterStatus) result = result.filter(i => i.status === this.filterStatus);
    if (this.filterCategory) result = result.filter(i => i.category === this.filterCategory);
    this.filteredInterventions.set(result);
  }

  onFilterStatus(event: Event): void {
    this.filterStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onFilterCategory(event: Event): void {
    this.filterCategory = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminée';
      case 'NOUVEAU': return 'Nouveau';
      default: return status;
    }
  }

  getStatusBg(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return '#e0e0e0';
      case 'EN_COURS': return '#000';
      case 'TERMINE': return '#f5f5f5';
      default: return '#fff';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return '#333';
      case 'EN_COURS': return '#fff';
      case 'TERMINE': return '#666';
      default: return '#000';
    }
  }

  openView(intervention: any): void { this.viewTarget.set(intervention); }

  markInProgress(intervention: any): void {
    this.mockData.update('interventions', intervention.id, { status: 'EN_COURS' });
    this.refresh();
    this.toast.success('Intervention en cours', `"${intervention.title}" est maintenant en cours`);
  }

  markComplete(intervention: any): void {
    this.mockData.update('interventions', intervention.id, { status: 'TERMINE' });
    this.refresh();
    this.toast.success('Intervention terminée', `"${intervention.title}" marquée comme terminée`);
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
