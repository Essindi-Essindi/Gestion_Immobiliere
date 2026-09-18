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
  templateUrl: './locataires.component.html',
  styleUrl: './locataires.component.scss'
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
