import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LogementService } from '@core/services/logement.service';
import { LocataireService } from '@core/services/locataire.service';
import { ToastService } from '@core/services/toast.service';
import { MontantPipe } from '@shared/pipes';
import { LogementRequest, LogementResponse } from '@core/models/logement.model';
import { LocataireResponse } from '@core/models/locataire.model';

// forme du template d'origine / shape used by the original template
interface pieceview { id: string; numero: string; type: string; capacite: number; occupants: { locataireId: string; nom: string }[]; }
interface logementview {
  id: string; status: string; type: string; surface: number; rent: number; charges: number; tenantName?: string;
  address: { street: string; postalCode: string; city: string; country: string };
  pieces: pieceview[];
}
interface locataireview { id: string; firstName: string; lastName: string; roomNumber?: string; logementId?: string; }

@Component({
  selector: 'app-logements',
  standalone: true,
  imports: [RouterModule, FormsModule, MontantPipe],
  templateUrl: './logements.component.html'
})
export class LogementsComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);

  logements = signal<logementview[]>([]);
  filteredLogements = signal<logementview[]>([]);
  allLocataires = signal<locataireview[]>([]);
  searchQuery = '';
  filterType = '';
  filterStatus = '';

  selected = signal<any>(null);
  showAdd = signal(false);
  showEdit = signal(false);
  showDeleteConfirm = signal(false);
  deleteTarget: logementview | null = null;
  assignLocId = '';
  assignRoomNum = '';

  formData: any = {};
  formPieces: any[] = [];

  constructor(
    private logementService: LogementService,
    private locataireService: LocataireService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  private toview(l: LogementResponse): logementview {
    return {
      id: String(l.id), status: l.status, type: l.type, surface: l.area, rent: l.rent, charges: l.charges,
      tenantName: l.locataire_name,
      address: { street: l.address, postalCode: l.postal_code, city: l.city, country: l.country },
      pieces: (l.pieces || []).map(p => ({
        id: String(p.id), numero: p.numero, type: p.type, capacite: p.capacite,
        occupants: (p.occupants || []).map(o => ({ locataireId: String(o.locataire_id), nom: o.nom }))
      }))
    };
  }

  private tolocataire(l: LocataireResponse): locataireview {
    return { id: String(l.id), firstName: l.first_name, lastName: l.last_name, roomNumber: l.piece_numero, logementId: l.logement_id ? String(l.logement_id) : undefined };
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    this.logementService.getAll().subscribe({
      next: (data) => {
        this.logements.set(data.map(l => this.toview(l)));
        this.applyFilters();
        const cur = this.selected();
        if (cur) this.selected.set(this.logements().find(l => l.id === cur.id) || null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les logements');
        this.loading.set(false);
      }
    });
    this.locataireService.getAll().subscribe({ next: (d) => this.allLocataires.set(d.map(l => this.tolocataire(l))), error: () => {} });
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

  roomCount(l: logementview): number {
    return (l.pieces || []).filter(p => p.type === 'CHAMBRE' || p.type === 'BUREAU').length;
  }
  occupantCount(l: logementview): number {
    return (l.pieces || []).reduce((n, p) => n + p.occupants.length, 0);
  }
  occupancyRate(l: logementview): number {
    const rooms = (l.pieces || []).filter(p => p.capacite > 0);
    const cap = rooms.reduce((n, p) => n + p.capacite, 0);
    if (!cap) return 0;
    return Math.round(this.occupantCount(l) / cap * 100);
  }
  freeRooms(l: logementview | null): pieceview[] {
    if (!l) return [];
    return (l.pieces || []).filter(p => p.capacite > 0 && p.occupants.length < p.capacite);
  }

  pieceTypeLabel(t: string): string {
    const map: Record<string, string> = { CHAMBRE: 'Chambre', SALON: 'Salon', CUISINE: 'Cuisine', SALLE_DE_BAIN: 'Salle de bain', BUREAU: 'Bureau', AUTRE: 'Autre' };
    return map[t] || t;
  }

  openDetail(l: logementview): void {
    this.assignLocId = '';
    this.assignRoomNum = '';
    this.selected.set(l);
  }
  closeDetail(): void { this.selected.set(null); }

  releaseOccupant(piece: pieceview, occ: { locataireId: string; nom: string }): void {
    this.logementService.release(this.selected()!.id, occ.locataireId).subscribe({
      next: () => {
        this.refresh();
        this.toast.success('Chambre libérée', `${occ.nom} a été retiré de ${piece.numero}`);
      }
    });
  }

  doAssign(): void {
    if (!this.assignLocId || !this.assignRoomNum) {
      this.toast.warning('Attention', 'Choisissez un locataire et une chambre');
      return;
    }
    const sel: logementview = this.selected();
    const loc = this.allLocataires().find(l => l.id === String(this.assignLocId));
    const room = sel.pieces.find((p: pieceview) => p.numero === this.assignRoomNum);
    if (!loc || !room) return;
    this.logementService.assign(sel.id, loc.id, room.id).subscribe({
      next: () => {
        this.assignLocId = '';
        this.assignRoomNum = '';
        this.refresh();
        this.toast.success('Assignation réussie', `${loc.firstName} ${loc.lastName} assigné à la chambre ${room.numero}`);
      }
    });
  }

  openAdd(): void {
    this.formData = { street: '', city: '', postalCode: '', country: 'France', type: 'APPARTEMENT', surface: 50, rent: 500, charges: 0 };
    this.formPieces = [
      { numero: 'CH-1', type: 'CHAMBRE', capacite: 1 },
      { numero: 'SAL-1', type: 'SALON', capacite: 0 },
      { numero: 'CUI-1', type: 'CUISINE', capacite: 0 }
    ];
    this.showAdd.set(true);
  }

  openEdit(l: logementview, event: Event): void {
    event.stopPropagation();
    this.formData = { id: l.id, street: l.address.street, city: l.address.city, postalCode: l.address.postalCode, country: l.address.country, type: l.type, surface: l.surface, rent: l.rent, charges: l.charges || 0 };
    this.formPieces = (l.pieces || []).map(p => ({ numero: p.numero, type: p.type, capacite: p.capacite }));
    this.showEdit.set(true);
  }

  closeForm(): void { this.showAdd.set(false); this.showEdit.set(false); }

  addPieceRow(): void {
    this.formPieces.push({ numero: 'CH-' + (this.formPieces.length + 1), type: 'CHAMBRE', capacite: 1 });
  }
  removePieceRow(i: number): void { this.formPieces.splice(i, 1); }

  saveForm(): void {
    if (!this.formData.street || !this.formData.city) {
      this.toast.warning('Attention', 'Adresse et ville sont obligatoires');
      return;
    }
    const numeros = this.formPieces.map(p => String(p.numero || '').trim().toUpperCase());
    if (numeros.some(n => !n)) {
      this.toast.warning('Attention', 'Chaque pièce doit avoir un numéro');
      return;
    }
    if (new Set(numeros).size !== numeros.length) {
      this.toast.warning('Attention', 'Deux pièces ont le même numéro');
      return;
    }
    const payload: LogementRequest = {
      address: this.formData.street,
      postal_code: this.formData.postalCode || '75000',
      city: this.formData.city,
      country: this.formData.country || 'France',
      type: this.formData.type,
      area: Number(this.formData.surface) || 0,
      rent: Number(this.formData.rent) || 0,
      charges: Number(this.formData.charges) || 0,
      pieces: this.formPieces.map(p => ({ numero: String(p.numero).trim(), type: p.type, capacite: Math.max(0, Number(p.capacite) || 0) }))
    };
    if (this.showAdd()) {
      this.logementService.create(payload).subscribe({
        next: () => {
          this.toast.success('Logement ajouté', 'Le logement a été créé avec ses pièces');
          this.closeForm();
          this.refresh();
        }
      });
    } else {
      this.logementService.update(this.formData.id, payload).subscribe({
        next: () => {
          this.toast.success('Logement modifié', 'Les modifications ont été enregistrées');
          this.closeForm();
          this.refresh();
        }
      });
    }
  }

  askDelete(l: logementview, event: Event): void {
    event.stopPropagation();
    this.deleteTarget = l;
    this.showDeleteConfirm.set(true);
  }
  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.logementService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.showDeleteConfirm.set(false);
        this.deleteTarget = null;
        this.toast.success('Supprimé', 'Le logement a été supprimé');
        this.refresh();
      },
      error: () => this.showDeleteConfirm.set(false)
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'LOUE': return 'Occupé';
      case 'VACANT': return 'Disponible';
      default: return status;
    }
  }
  getStatusBg(status: string): string { return status === 'LOUE' ? '#000' : '#fff'; }
  getStatusColor(status: string): string { return status === 'LOUE' ? '#fff' : '#000'; }
}
