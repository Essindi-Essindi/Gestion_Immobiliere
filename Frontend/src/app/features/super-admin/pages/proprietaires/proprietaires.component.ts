import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '@core/services/mock-data.service';

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
  templateUrl: './proprietaires.component.html',
  styleUrl: './proprietaires.component.scss'
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
