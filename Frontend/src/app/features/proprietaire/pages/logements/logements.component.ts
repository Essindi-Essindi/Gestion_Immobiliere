import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { MontantPipe } from '@shared/pipes';

@Component({
  selector: 'app-logements',
  standalone: true,
  imports: [RouterModule, FormsModule, MontantPipe],
  templateUrl: './logements.component.html'
})
export class LogementsComponent implements OnInit {
  logements = signal<any[]>([]);
  filteredLogements = signal<any[]>([]);
  allLocataires = signal<any[]>([]);
  searchQuery = '';
  filterType = '';
  filterStatus = '';

  selected = signal<any>(null);
  showAdd = signal(false);
  showEdit = signal(false);
  showDeleteConfirm = signal(false);
  deleteTarget: any = null;
  assignLocId = '';
  assignRoomNum = '';

  formData: any = {};
  formPieces: any[] = [];

  constructor(private mockData: MockDataService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.logements.set(this.mockData.getAll('logements'));
    this.allLocataires.set(this.mockData.getAll('locataires'));
    this.applyFilters();
    if (this.selected()) {
      const fresh = this.mockData.getById('logements', this.selected().id);
      this.selected.set(fresh);
    }
  }

  applyFilters(): void {
    let result = this.logements();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(l => l.address.street.toLowerCase().includes(q) || l.address.city.toLowerCase().includes(q));
    }
    if (this.filterType) result = result.filter(l => l.type === this.filterType);
    if (this.filterStatus) result = result.filter(l => l.status === this.filterStatus);
    this.filteredLogements.set(result);
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
  onFilterType(event: Event): void {
    this.filterType = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
  onFilterStatus(event: Event): void {
    this.filterStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  roomCount(l: any): number {
    return (l.pieces || []).filter((p: any) => p.type === 'CHAMBRE' || p.type === 'BUREAU').length;
  }
  occupantCount(l: any): number {
    return (l.pieces || []).reduce((n: number, p: any) => n + (p.occupants ? p.occupants.length : 0), 0);
  }
  occupancyRate(l: any): number {
    const rooms = (l.pieces || []).filter((p: any) => (p.capacite || 0) > 0);
    const cap = rooms.reduce((n: number, p: any) => n + p.capacite, 0);
    if (!cap) return 0;
    return Math.round(this.occupantCount(l) / cap * 100);
  }
  freeRooms(l: any): any[] {
    return (l.pieces || []).filter((p: any) => (p.type === 'CHAMBRE' || p.type === 'BUREAU') && p.occupants.length < (p.capacite || 1));
  }

  pieceTypeLabel(t: string): string {
    const map: Record<string, string> = { CHAMBRE: 'Chambre', SALON: 'Salon', CUISINE: 'Cuisine', SALLE_DE_BAIN: 'Salle de bain', BUREAU: 'Bureau', AUTRE: 'Autre' };
    return map[t] || t;
  }

  openDetail(l: any): void {
    this.assignLocId = '';
    this.assignRoomNum = '';
    this.selected.set(this.mockData.getById('logements', l.id));
  }
  closeDetail(): void { this.selected.set(null); }

  releaseOccupant(piece: any, occ: any): void {
    this.mockData.releaseRoom(this.selected().id, piece.numero, occ.locataireId);
    this.refresh();
    this.toast.success('Chambre libérée', `${occ.nom} a été retiré de ${piece.numero}`);
  }

  doAssign(): void {
    if (!this.assignLocId || !this.assignRoomNum) {
      this.toast.warning('Attention', 'Choisissez un locataire et une chambre');
      return;
    }
    const loc = this.allLocataires().find((l: any) => l.id === this.assignLocId);
    if (loc && loc.roomNumber) {
      this.mockData.releaseRoom(loc.logementId, loc.roomNumber, loc.id);
    }
    const ok = this.mockData.assignRoom(this.selected().id, this.assignRoomNum, { id: this.assignLocId, nom: loc.firstName + ' ' + loc.lastName });
    if (ok) {
      this.assignLocId = '';
      this.assignRoomNum = '';
      this.refresh();
      this.toast.success('Assignation réussie', `${loc.firstName} ${loc.lastName} assigné à la chambre`);
    } else {
      this.toast.warning('Chambre complète', 'Cette chambre a atteint sa capacité maximale');
    }
  }

  openAdd(): void {
    this.formData = { street: '', city: '', postalCode: '', type: 'APPARTEMENT', surface: 50, rent: 500, charges: 0, status: 'VACANT' };
    this.formPieces = [
      { numero: 'CH-1', type: 'CHAMBRE', capacite: 1, occupants: [] },
      { numero: 'SAL-1', type: 'SALON', capacite: 0, occupants: [] },
      { numero: 'CUI-1', type: 'CUISINE', capacite: 0, occupants: [] }
    ];
    this.showAdd.set(true);
  }

  openEdit(l: any, event: Event): void {
    event.stopPropagation();
    const full = this.mockData.getById('logements', l.id);
    this.formData = { id: full.id, street: full.address.street, city: full.address.city, postalCode: full.address.postalCode, type: full.type, surface: full.surface, rent: full.rent, charges: full.charges || 0, status: full.status };
    this.formPieces = (full.pieces || []).map((p: any) => ({ numero: p.numero, type: p.type, capacite: p.capacite, occupants: [...(p.occupants || [])] }));
    this.showEdit.set(true);
  }

  closeForm(): void { this.showAdd.set(false); this.showEdit.set(false); }

  addPieceRow(): void {
    this.formPieces.push({ numero: 'CH-' + (this.formPieces.length + 1), type: 'CHAMBRE', capacite: 1, occupants: [] });
  }
  removePieceRow(i: number): void { this.formPieces.splice(i, 1); }

  saveForm(): void {
    if (!this.formData.street || !this.formData.city) {
      this.toast.warning('Attention', 'Adresse et ville sont obligatoires');
      return;
    }
    if (this.showAdd()) {
      this.mockData.create('logements', {
        address: { street: this.formData.street, postalCode: this.formData.postalCode || '75000', city: this.formData.city, country: 'France' },
        type: this.formData.type, status: this.formData.status, surface: Number(this.formData.surface) || 50,
        rooms: this.formPieces.length, rent: Number(this.formData.rent) || 0, charges: Number(this.formData.charges) || 0,
        deposit: 0, photos: [], diagnostics: [], pieces: this.formPieces
      });
      this.toast.success('Logement ajouté', 'Le logement a été créé avec ses pièces');
    } else {
      this.mockData.update('logements', this.formData.id, {
        address: { street: this.formData.street, postalCode: this.formData.postalCode, city: this.formData.city, country: 'France' },
        type: this.formData.type, status: this.formData.status, surface: Number(this.formData.surface),
        rooms: this.formPieces.length, rent: Number(this.formData.rent), charges: Number(this.formData.charges),
        pieces: this.formPieces
      });
      this.toast.success('Logement modifié', 'Les modifications ont été enregistrées');
    }
    this.closeForm();
    this.refresh();
  }

  askDelete(l: any, event: Event): void {
    event.stopPropagation();
    this.deleteTarget = l;
    this.showDeleteConfirm.set(true);
  }
  confirmDelete(): void {
    this.mockData.delete('logements', this.deleteTarget.id);
    this.showDeleteConfirm.set(false);
    this.deleteTarget = null;
    this.refresh();
    this.toast.success('Supprimé', 'Le logement a été supprimé');
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'LOUE': return 'Occupé';
      case 'VACANT': return 'Disponible';
      case 'EN_TRAVAUX': return 'En maintenance';
      default: return status;
    }
  }
  getStatusBg(status: string): string {
    switch (status) {
      case 'LOUE': return '#000';
      case 'VACANT': return '#fff';
      case 'EN_TRAVAUX': return '#e0e0e0';
      default: return '#fff';
    }
  }
  getStatusColor(status: string): string {
    switch (status) {
      case 'LOUE': return '#fff';
      case 'VACANT': return '#000';
      case 'EN_TRAVAUX': return '#333';
      default: return '#000';
    }
  }
}
