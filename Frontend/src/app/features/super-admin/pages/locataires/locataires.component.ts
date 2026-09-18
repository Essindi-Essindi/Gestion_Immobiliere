import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '@core/services/mock-data.service';

interface Locataire {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  logement: string;
  chambre: string;
  contrat: string;
  statut: string;
  proprietaire: string;
}

@Component({
  selector: 'app-locataires',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des locataires</h1>
          <p>Liste globale de tous les locataires de la plateforme</p>
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
            <button [class.active]="statusFilter() === 'Inactif'" (click)="setStatusFilter('Inactif')">Inactif</button>
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
                  <th>Logement assigné</th>
                  <th>Chambre</th>
                  <th>Contrat</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (l of filtered(); track l.id) {
                  <tr>
                    <td class="cell-bold">{{ l.nom }}</td>
                    <td>{{ l.email }}</td>
                    <td>{{ l.telephone }}</td>
                    <td>{{ l.logement }}</td>
                    <td>
                      @if (l.chambre) {
                        <span class="badge badge-dark">{{ l.chambre }}</span>
                      } @else {
                        <span class="muted">-</span>
                      }
                    </td>
                    <td><span class="badge">{{ l.contrat }}</span></td>
                    <td>
                      <span class="status" [class.active]="l.statut === 'Actif'" [class.inactive]="l.statut === 'Inactif'">
                        {{ l.statut }}
                      </span>
                    </td>
                    <td>
                      <button class="btn-action" (click)="viewDetails(l)">Voir détails</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <p>Aucun locataire trouvé</p>
            <span>Modifiez vos critères de recherche</span>
          </div>
        }
      </div>

      @if (selectedLocataire()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Détails du locataire</h2>
              <button class="modal-close" (click)="closeModal()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="detail-grid">
                <div class="detail-row">
                  <span class="detail-label">Nom complet</span>
                  <span class="detail-value">{{ selectedLocataire()?.nom }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">{{ selectedLocataire()?.email }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Téléphone</span>
                  <span class="detail-value">{{ selectedLocataire()?.telephone }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Logement assigné</span>
                  <span class="detail-value">{{ selectedLocataire()?.logement }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Chambre</span>
                  <span class="detail-value">{{ selectedLocataire()?.chambre || '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Contrat</span>
                  <span class="detail-value">{{ selectedLocataire()?.contrat }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Propriétaire</span>
                  <span class="detail-value">{{ selectedLocataire()?.proprietaire }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Statut</span>
                  <span class="detail-value">{{ selectedLocataire()?.statut }}</span>
                </div>
              </div>
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
    .status { font-size: 12px; font-weight: 600; padding: 2px 10px; display: inline-block; }
    .status.active { background: #000; color: #fff; }
    .status.inactive { background: #e0e0e0; color: #666; }
    .btn-action { padding: 6px 14px; font-size: 12px; border: 1px solid #e0e0e0; background: #fff; color: #000; cursor: pointer; font-family: inherit; font-weight: 500; }
    .btn-action:hover { background: #f5f5f5; }
    .empty { padding: 60px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .empty p { margin: 0; font-size: 15px; color: #000; font-weight: 600; }
    .empty span { font-size: 13px; color: #999; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border: 1px solid #e0e0e0; width: 520px; max-width: 95vw; }
    .modal-header { padding: 20px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; justify-content: space-between; }
    .modal-header h2 { margin: 0; font-size: 16px; font-weight: 700; color: #000; font-family: inherit; }
    .modal-close { border: none; background: none; cursor: pointer; padding: 4px; color: #666; }
    .modal-body { padding: 20px; }
    .detail-grid { display: flex; flex-direction: column; }
    .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { width: 160px; font-size: 13px; color: #666; flex-shrink: 0; }
    .detail-value { font-size: 13px; color: #000; font-weight: 500; }
    .modal-footer { padding: 16px 20px; border-top: 1px solid #e0e0e0; display: flex; justify-content: flex-end; }
    .btn-outline { padding: 8px 20px; font-size: 13px; border: 1px solid #e0e0e0; background: #fff; color: #000; cursor: pointer; font-family: inherit; font-weight: 500; }
    .btn-outline:hover { background: #f5f5f5; }
    @media (max-width: 640px) { .card-toolbar { flex-direction: column; align-items: stretch; } }
  `]
})
export class LocatairesComponent implements OnInit {
  searchTerm = '';
  statusFilter = signal('Tous');
  selectedLocataire = signal<Locataire | null>(null);

  locataires = signal<Locataire[]>([]);
  filtered = signal<Locataire[]>([]);

  constructor(private mockData: MockDataService) {}

  ngOnInit(): void {
    const list = this.mockData.getAll('locataires');
    const contrats = this.mockData.getAll('contrats');
    this.locataires.set(list.map((l: any) => {
      const contrat = contrats.find((c: any) => c.locataireId === l.id);
      return {
        id: l.id,
        nom: `${l.firstName} ${l.lastName}`,
        email: l.email,
        telephone: l.phone || '-',
        logement: l.logementAddress || '-',
        chambre: l.roomNumber || '',
        contrat: contrat ? (contrat.status === 'ACTIF' ? 'Actif' : contrat.status === 'EXPIRE' ? 'Expiré' : 'Résilié') : 'Aucun',
        statut: l.status === 'ACTIF' ? 'Actif' : 'Inactif',
        proprietaire: '-'
      };
    }));
    this.filterList();
  }

  filterList(): void {
    const term = this.searchTerm.toLowerCase();
    const status = this.statusFilter();
    this.filtered.set(
      this.locataires().filter(l => {
        const matchSearch = !term || l.nom.toLowerCase().includes(term) || l.email.toLowerCase().includes(term);
        const matchStatus = status === 'Tous' || l.statut === status;
        return matchSearch && matchStatus;
      })
    );
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.filterList();
  }

  viewDetails(l: Locataire): void {
    this.selectedLocataire.set(l);
  }

  closeModal(): void {
    this.selectedLocataire.set(null);
  }
}
