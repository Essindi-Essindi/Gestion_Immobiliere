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
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss'
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
