import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface LogEntry {
  id: number;
  date: string;
  utilisateur: string;
  action: string;
  details: string;
  ip: string;
  type: 'login' | 'create' | 'update' | 'delete';
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Logs & Activité</h1>
          <p>Journal des actions effectuées sur la plateforme</p>
        </div>
        <button class="btn-export">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exporter
        </button>
      </div>

      <div class="card">
        <div class="card-toolbar">
          <div class="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Rechercher dans les logs..." [(ngModel)]="searchTerm" (ngModelChange)="filterLogs()">
          </div>
          <div class="filters">
            <button [class.active]="typeFilter() === 'Tous'" (click)="setTypeFilter('Tous')">Tous</button>
            <button [class.active]="typeFilter() === 'login'" (click)="setTypeFilter('login')">Connexion</button>
            <button [class.active]="typeFilter() === 'create'" (click)="setTypeFilter('create')">Création</button>
            <button [class.active]="typeFilter() === 'update'" (click)="setTypeFilter('update')">Modification</button>
            <button [class.active]="typeFilter() === 'delete'" (click)="setTypeFilter('delete')">Suppression</button>
          </div>
        </div>

        @if (filtered().length > 0) {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Utilisateur</th>
                  <th>Action</th>
                  <th>Détails</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                @for (log of filtered(); track log.id) {
                  <tr>
                    <td class="cell-mono">{{ log.date }}</td>
                    <td class="cell-bold">{{ log.utilisateur }}</td>
                    <td>
                      <span class="action-badge" [class]="'type-' + log.type">
                        {{ getActionLabel(log.type) }}
                      </span>
                    </td>
                    <td>{{ log.details }}</td>
                    <td class="cell-mono">{{ log.ip }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <p>Aucun log trouvé</p>
            <span>Aucune activité ne correspond à vos critères</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; background: #f5f5f5; min-height: 100vh; }
    .page-header { margin-bottom: 24px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
    .page-header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #000; font-family: inherit; }
    .page-header p { margin: 0; font-size: 14px; color: #666; font-family: inherit; }
    .btn-export { display: flex; align-items: center; gap: 8px; padding: 10px 16px; font-size: 13px; font-weight: 600; border: 1px solid #000; background: #000; color: #fff; cursor: pointer; font-family: inherit; white-space: nowrap; }
    .btn-export:hover { background: #222; }
    .card { background: #fff; border: 1px solid #e0e0e0; }
    .card-toolbar { padding: 16px 20px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .search { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 240px; border: 1px solid #e0e0e0; padding: 8px 12px; }
    .search input { border: none; outline: none; flex: 1; font-size: 13px; color: #000; font-family: inherit; background: transparent; }
    .filters { display: flex; gap: 0; }
    .filters button { padding: 8px 12px; font-size: 12px; border: 1px solid #e0e0e0; background: #fff; color: #666; cursor: pointer; font-family: inherit; margin-left: -1px; white-space: nowrap; }
    .filters button:first-child { margin-left: 0; }
    .filters button.active { background: #000; color: #fff; border-color: #000; z-index: 1; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 20px; text-align: left; font-size: 13px; border-bottom: 1px solid #f0f0f0; font-family: inherit; }
    th { background: #fafafa; font-weight: 600; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { color: #000; }
    tr:hover td { background: #fafafa; }
    .cell-bold { font-weight: 600; }
    .cell-mono { font-family: monospace; font-size: 12px; color: #666; }
    .action-badge { display: inline-block; padding: 2px 10px; font-size: 11px; font-weight: 600; }
    .type-login { background: #f0f0f0; color: #000; }
    .type-create { background: #000; color: #fff; }
    .type-update { background: #888; color: #fff; }
    .type-delete { background: #ccc; color: #000; }
    .empty { padding: 60px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .empty p { margin: 0; font-size: 15px; color: #000; font-weight: 600; }
    .empty span { font-size: 13px; color: #999; }
    @media (max-width: 640px) { .page-header { flex-direction: column; } .card-toolbar { flex-direction: column; align-items: stretch; } }
  `]
})
export class LogsComponent {
  searchTerm = '';
  typeFilter = signal('Tous');

  logs = signal<LogEntry[]>([
    { id: 1, date: '17/09/2026 09:15', utilisateur: 'Super Admin', action: 'Connexion', details: 'Connexion réussie au tableau de bord', ip: '192.168.1.1', type: 'login' },
    { id: 2, date: '17/09/2026 08:42', utilisateur: 'Jean Dupont', action: 'Création', details: 'Nouveau logement créé : Appartement T3 Yaoundé', ip: '10.0.0.45', type: 'create' },
    { id: 3, date: '16/09/2026 17:30', utilisateur: 'Sophie Kamga', action: 'Modification', details: 'Profil mis à jour : numéro de téléphone', ip: '10.0.0.78', type: 'update' },
    { id: 4, date: '16/09/2026 15:12', utilisateur: 'Super Admin', action: 'Suppression', details: 'Contrat #CTR-2024-089 supprimé', ip: '192.168.1.1', type: 'delete' },
    { id: 5, date: '16/09/2026 14:05', utilisateur: 'Paul Mbarga', action: 'Connexion', details: 'Connexion depuis navigateur Chrome', ip: '10.0.0.12', type: 'login' },
    { id: 6, date: '16/09/2026 11:28', utilisateur: 'Super Admin', action: 'Création', details: 'Nouveau locataire ajouté : Ahmadou Bello', ip: '192.168.1.1', type: 'create' },
    { id: 7, date: '15/09/2026 16:50', utilisateur: 'Marie Ndjock', action: 'Modification', details: 'Quittance de loyer générée pour Appartement T1', ip: '10.0.0.33', type: 'update' },
    { id: 8, date: '15/09/2026 14:20', utilisateur: 'Super Admin', action: 'Modification', details: 'Plan d\'abonnement de Paul Mbarga suspendu', ip: '192.168.1.1', type: 'update' },
    { id: 9, date: '15/09/2026 10:05', utilisateur: 'Claire Fotsing', action: 'Connexion', details: 'Connexion réussie', ip: '10.0.0.91', type: 'login' },
    { id: 10, date: '14/09/2026 18:33', utilisateur: 'Super Admin', action: 'Création', details: 'Nouveau ticket de support créé : #SUP-042', ip: '192.168.1.1', type: 'create' },
    { id: 11, date: '14/09/2026 13:15', utilisateur: 'Ahmed Bello', action: 'Modification', details: 'Mot de passe modifié', ip: '10.0.0.56', type: 'update' },
    { id: 12, date: '14/09/2026 09:40', utilisateur: 'Super Admin', action: 'Suppression', details: 'Notification système supprimée', ip: '192.168.1.1', type: 'delete' },
    { id: 13, date: '13/09/2026 15:22', utilisateur: 'Olivier Tchinda', action: 'Connexion', details: 'Tentative de connexion échouée', ip: '10.0.0.88', type: 'login' },
    { id: 14, date: '13/09/2026 11:10', utilisateur: 'Super Admin', action: 'Création', details: 'Nouveau bailleur créé : Fatima Aloui', ip: '192.168.1.1', type: 'create' }
  ]);

  filtered = signal<LogEntry[]>([]);

  constructor() {
    this.filterLogs();
  }

  filterLogs(): void {
    const term = this.searchTerm.toLowerCase();
    const type = this.typeFilter();
    this.filtered.set(
      this.logs().filter(l => {
        const matchSearch = !term || l.utilisateur.toLowerCase().includes(term) || l.details.toLowerCase().includes(term) || l.ip.includes(term);
        const matchType = type === 'Tous' || l.type === type;
        return matchSearch && matchType;
      })
    );
  }

  setTypeFilter(type: string): void {
    this.typeFilter.set(type);
    this.filterLogs();
  }

  getActionLabel(type: string): string {
    switch (type) {
      case 'login': return 'Connexion';
      case 'create': return 'Création';
      case 'update': return 'Modification';
      case 'delete': return 'Suppression';
      default: return type;
    }
  }
}
