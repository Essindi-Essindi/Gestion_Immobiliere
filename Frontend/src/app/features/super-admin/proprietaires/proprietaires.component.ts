import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../core/services/mock-data.service';

interface Proprietaire {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  societe: string;
  plan: string;
  statut: string;
  logements: number;
  inscription: string;
}

@Component({
  selector: 'app-proprietaires',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des propriétaires</h1>
          <p>Liste des comptes propriétaires enregistrés</p>
        </div>
      </div>

      <div class="card">
        <div class="card-toolbar">
          <div class="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Rechercher par nom, email..." [(ngModel)]="searchTerm" (ngModelChange)="filterList()">
          </div>
          <div class="filters">
            <button [class.active]="statusFilter() === 'Tous'" (click)="setStatusFilter('Tous')">Tous</button>
            <button [class.active]="statusFilter() === 'Actif'" (click)="setStatusFilter('Actif')">Actif</button>
            <button [class.active]="statusFilter() === 'Suspendu'" (click)="setStatusFilter('Suspendu')">Suspendu</button>
          </div>
        </div>

        @if (filtered().length > 0) {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Société</th>
                  <th>Plan</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (p of filtered(); track p.id) {
                  <tr>
                    <td class="cell-bold">{{ p.nom }}</td>
                    <td>{{ p.email }}</td>
                    <td>{{ p.telephone }}</td>
                    <td>{{ p.societe }}</td>
                    <td><span class="badge">{{ p.plan }}</span></td>
                    <td>
                      <span class="status" [class.active]="p.statut === 'Actif'" [class.suspended]="p.statut === 'Suspendu'">
                        {{ p.statut }}
                      </span>
                    </td>
                    <td>
                      <div class="actions">
                        <button class="btn-action" (click)="viewDetails(p)">Voir</button>
                        <button class="btn-action danger" (click)="toggleStatus(p)">
                          {{ p.statut === 'Actif' ? 'Suspendre' : 'Activer' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <p>Aucun propriétaire trouvé</p>
            <span>Modifiez vos critères de recherche</span>
          </div>
        }
      </div>

      @if (selectedProp()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Détails du propriétaire</h2>
              <button class="modal-close" (click)="closeModal()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="detail-grid">
                <div class="detail-row">
                  <span class="detail-label">Nom complet</span>
                  <span class="detail-value">{{ selectedProp()?.nom }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">{{ selectedProp()?.email }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Téléphone</span>
                  <span class="detail-value">{{ selectedProp()?.telephone }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Société</span>
                  <span class="detail-value">{{ selectedProp()?.societe }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Plan</span>
                  <span class="detail-value">{{ selectedProp()?.plan }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Statut</span>
                  <span class="detail-value">{{ selectedProp()?.statut }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Logements</span>
                  <span class="detail-value">{{ ownerProperties().length }} bien(s)</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date d'inscription</span>
                  <span class="detail-value">{{ selectedProp()?.inscription }}</span>
                </div>
              </div>

              <h3 class="section-title">Biens immobiliers ({{ ownerProperties().length }})</h3>
              @if (ownerProperties().length === 0) {
                <p class="muted">Aucun bien enregistré pour ce propriétaire.</p>
              } @else {
                @for (bien of ownerProperties(); track bien.id) {
                  <div class="property-card">
                    <div class="property-head">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <span class="property-address">{{ bien.address.street }}, {{ bien.address.city }}</span>
                      <span class="badge">{{ bien.type }}</span>
                    </div>
                    <p class="property-desc">{{ propertyDescription(bien) }}</p>
                    <div class="property-meta">
                      <span>{{ bien.surface }} m²</span>
                      <span>{{ bien.rent }} €/mois</span>
                      <span>{{ occupantsOf(bien.id).length }} occupant(s)</span>
                    </div>
                    <div class="pieces">
                      <span class="pieces-title">Pièces :</span>
                      @for (piece of bien.pieces || []; track piece.numero) {
                        <span class="piece-chip" [class.occupied]="piece.occupants && piece.occupants.length > 0">
                          {{ piece.numero }} · {{ pieceTypeLabel(piece.type) }} ({{ piece.occupants ? piece.occupants.length : 0 }}/{{ piece.capacite }})
                        </span>
                      }
                    </div>
                    <div class="occupants">
                      @if (occupantsOf(bien.id).length === 0) {
                        <span class="muted">Aucun locataire</span>
                      } @else {
                        @for (occ of occupantsOf(bien.id); track occ.id) {
                          <div class="occupant-row">
                            <span class="occupant-name">{{ occ.firstName }} {{ occ.lastName }}</span>
                            @if (occ.roomNumber) {
                              <span class="badge badge-dark">Ch. {{ occ.roomNumber }}</span>
                            } @else {
                              <span class="muted">Logement entier</span>
                            }
                          </div>
                        }
                      }
                    </div>
                  </div>
                }
              }
            </div>
            <div class="modal-footer">
              <button class="btn-outline" (click)="closeModal()">Fermer</button>
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
    .card { background: #fff; border: 1px solid #e0e0e0; }
    .card-toolbar { padding: 16px 20px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .search { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 240px; border: 1px solid #e0e0e0; padding: 8px 12px; }
    .search input { border: none; outline: none; flex: 1; font-size: 13px; color: #000; font-family: inherit; background: transparent; }
    .filters { display: flex; gap: 0; }
    .filters button { padding: 8px 16px; font-size: 13px; border: 1px solid #e0e0e0; background: #fff; color: #666; cursor: pointer; font-family: inherit; margin-left: -1px; }
    .filters button:first-child { margin-left: 0; }
    .filters button.active { background: #000; color: #fff; border-color: #000; z-index: 1; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 20px; text-align: left; font-size: 13px; border-bottom: 1px solid #f0f0f0; font-family: inherit; }
    th { background: #fafafa; font-weight: 600; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { color: #000; }
    tr:hover td { background: #fafafa; }
    .cell-bold { font-weight: 600; }
    .badge { display: inline-block; padding: 2px 10px; font-size: 11px; font-weight: 600; background: #f0f0f0; color: #000; }
    .badge-dark { background: #000; color: #fff; }
    .muted { color: #999; font-size: 13px; }
    .section-title { margin: 20px 0 12px; font-size: 14px; font-weight: 700; color: #000; text-transform: uppercase; font-family: inherit; }
    .property-card { border: 1px solid #e0e0e0; padding: 14px 16px; margin-bottom: 12px; }
    .property-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .property-address { font-size: 14px; font-weight: 700; color: #000; flex: 1; }
    .property-desc { margin: 0 0 8px; font-size: 13px; color: #666; }
    .property-meta { display: flex; gap: 16px; font-size: 12px; color: #666; margin-bottom: 10px; }
    .pieces { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 10px; }
    .pieces-title { font-size: 12px; font-weight: 700; color: #000; }
    .piece-chip { font-size: 11px; padding: 3px 8px; background: #f5f5f5; border: 1px solid #e0e0e0; color: #333; }
    .piece-chip.occupied { background: #000; color: #fff; border-color: #000; }
    .occupants { border-top: 1px solid #f0f0f0; padding-top: 8px; display: flex; flex-direction: column; gap: 6px; }
    .occupant-row { display: flex; align-items: center; justify-content: space-between; }
    .occupant-name { font-size: 13px; color: #000; font-weight: 500; }
    .status { font-size: 12px; font-weight: 600; padding: 2px 10px; display: inline-block; }
    .status.active { background: #000; color: #fff; }
    .status.suspended { background: #e0e0e0; color: #666; }
    .actions { display: flex; gap: 8px; }
    .btn-action { padding: 6px 14px; font-size: 12px; border: 1px solid #e0e0e0; background: #fff; color: #000; cursor: pointer; font-family: inherit; font-weight: 500; }
    .btn-action:hover { background: #f5f5f5; }
    .btn-action.danger { color: #666; }
    .btn-action.danger:hover { background: #000; color: #fff; border-color: #000; }
    .empty { padding: 60px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .empty p { margin: 0; font-size: 15px; color: #000; font-weight: 600; }
    .empty span { font-size: 13px; color: #999; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border: 1px solid #e0e0e0; width: 680px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
    .modal-header { padding: 20px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; justify-content: space-between; }
    .modal-header h2 { margin: 0; font-size: 16px; font-weight: 700; color: #000; font-family: inherit; }
    .modal-close { border: none; background: none; cursor: pointer; padding: 4px; color: #666; }
    .modal-body { padding: 20px; }
    .detail-grid { display: flex; flex-direction: column; gap: 0; }
    .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { width: 160px; font-size: 13px; color: #666; flex-shrink: 0; }
    .detail-value { font-size: 13px; color: #000; font-weight: 500; }
    .modal-footer { padding: 16px 20px; border-top: 1px solid #e0e0e0; display: flex; justify-content: flex-end; }
    .btn-outline { padding: 8px 20px; font-size: 13px; border: 1px solid #e0e0e0; background: #fff; color: #000; cursor: pointer; font-family: inherit; font-weight: 500; }
    .btn-outline:hover { background: #f5f5f5; }
    @media (max-width: 640px) { .card-toolbar { flex-direction: column; align-items: stretch; } .filters { flex-wrap: wrap; } }
  `]
})
export class ProprietairesComponent {
  searchTerm = '';
  statusFilter = signal('Tous');
  selectedProp = signal<Proprietaire | null>(null);

  proprietaires = signal<Proprietaire[]>([
    { id: 1, nom: 'Jean Dupont', email: 'jean.dupont@email.com', telephone: '+237 691 234 567', societe: 'Dupont Immobilier', plan: 'Premium', statut: 'Actif', logements: 12, inscription: '15 Jan 2024' },
    { id: 2, nom: 'Sophie Kamga', email: 'sophie.kamga@email.com', telephone: '+237 677 890 123', societe: 'Kamga Properties', plan: 'Enterprise', statut: 'Actif', logements: 28, inscription: '03 Mar 2024' },
    { id: 3, nom: 'Paul Mbarga', email: 'paul.mbarga@email.com', telephone: '+237 655 456 789', societe: 'Mbarga & Fils', plan: 'Basic', statut: 'Suspendu', logements: 5, inscription: '22 Jun 2024' },
    { id: 4, nom: 'Marie Ndjock', email: 'marie.ndjock@email.com', telephone: '+237 690 345 678', societe: 'Ndjock Homes', plan: 'Premium', statut: 'Actif', logements: 8, inscription: '11 Aoû 2024' },
    { id: 5, nom: 'Ahmed Bello', email: 'ahmed.bello@email.com', telephone: '+237 681 901 234', societe: 'Bello Estates', plan: 'Basic', statut: 'Actif', logements: 3, inscription: '05 Sep 2024' },
    { id: 6, nom: 'Claire Fotsing', email: 'claire.fotsing@email.com', telephone: '+237 672 567 890', societe: 'Fotsing Group', plan: 'Enterprise', statut: 'Actif', logements: 35, inscription: '18 Jan 2024' },
    { id: 7, nom: 'Olivier Tchinda', email: 'olivier.tchinda@email.com', telephone: '+237 663 234 567', societe: 'Tchinda SARL', plan: 'Premium', statut: 'Suspendu', logements: 10, inscription: '07 Nov 2024' },
    { id: 8, nom: 'Fatima Aloui', email: 'fatima.aloui@email.com', telephone: '+237 694 678 901', societe: 'Aloui Immobilier', plan: 'Basic', statut: 'Actif', logements: 2, inscription: '29 Déc 2024' }
  ]);

  filtered = signal<Proprietaire[]>([]);

  constructor(private mockData: MockDataService) {
    this.filterList();
  }

  ownerKey(p: Proprietaire | null): string {
    if (!p) return '';
    return 'p' + ((p.id - 1) % 3 + 1);
  }

  ownerProperties(): any[] {
    const p = this.selectedProp();
    if (!p) return [];
    return this.mockData.getLogementsByProprietaire(this.ownerKey(p));
  }

  occupantsOf(logementId: string): any[] {
    return this.mockData.getLocatairesByLogement(logementId);
  }

  propertyDescription(bien: any): string {
    return `${bien.type} de ${bien.surface} m²`;
  }

  pieceTypeLabel(t: string): string {
    const map: Record<string, string> = { CHAMBRE: 'Chambre', SALON: 'Salon', CUISINE: 'Cuisine', SALLE_DE_BAIN: 'Salle de bain', BUREAU: 'Bureau', AUTRE: 'Autre' };
    return map[t] || t;
  }

  filterList(): void {
    const term = this.searchTerm.toLowerCase();
    const status = this.statusFilter();
    this.filtered.set(
      this.proprietaires().filter(p => {
        const matchSearch = !term || p.nom.toLowerCase().includes(term) || p.email.toLowerCase().includes(term) || p.societe.toLowerCase().includes(term);
        const matchStatus = status === 'Tous' || p.statut === status;
        return matchSearch && matchStatus;
      })
    );
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.filterList();
  }

  viewDetails(p: Proprietaire): void {
    this.selectedProp.set(p);
  }

  closeModal(): void {
    this.selectedProp.set(null);
  }

  toggleStatus(p: Proprietaire): void {
    this.proprietaires.update(list =>
      list.map(x => x.id === p.id ? { ...x, statut: x.statut === 'Actif' ? 'Suspendu' : 'Actif' } : x)
    );
    this.filterList();
  }
}
