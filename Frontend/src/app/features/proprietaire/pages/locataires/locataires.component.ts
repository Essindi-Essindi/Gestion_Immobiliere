import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LocataireService } from '@core/services/locataire.service';
import { LogementService } from '@core/services/logement.service';
import { ToastService } from '@core/services/toast.service';
import { LocataireRequest, LocataireResponse } from '@core/models/locataire.model';
import { LogementResponse } from '@core/models/logement.model';

// forme du template d'origine / shape used by the original template
interface locataireview {
  id: string; firstName: string; lastName: string; email: string; phone: string;
  logementId: string; logementAddress: string; roomNumber: string; status: string;
}
interface logementview { id: string; address: { street: string; city: string }; pieces: { id: string; numero: string; capacite: number; type: string; occupants: any[] }[]; }

@Component({
  selector: 'app-locataires',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './locataires.component.html'
})
export class LocatairesComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);

  locataires = signal<locataireview[]>([]);
  filteredLocataires = signal<locataireview[]>([]);
  allLogements = signal<logementview[]>([]);
  searchQuery = '';
  filterStatus = '';

  viewTarget = signal<any>(null);
  showEdit = signal(false);
  showInvite = signal(false);
  showDeleteConfirm = signal(false);
  deleteTarget: locataireview | null = null;

  editForm: any = {};
  editRooms = signal<logementview['pieces']>([]);
  inviteForm: any = { firstName: '', lastName: '', email: '', phone: '', logementId: '', roomNumber: '' };
  inviteRooms = signal<logementview['pieces']>([]);

  constructor(
    private locataireService: LocataireService,
    private logementService: LogementService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  private toview(l: LocataireResponse): locataireview {
    return {
      id: String(l.id), firstName: l.first_name, lastName: l.last_name, email: l.email, phone: l.phone || '',
      logementId: l.logement_id ? String(l.logement_id) : '', logementAddress: l.logement_address || '-',
      roomNumber: l.piece_numero || '', status: l.activated ? 'ACTIF' : 'INACTIF'
    };
  }

  private tologement(l: LogementResponse): logementview {
    return {
      id: String(l.id), address: { street: l.address, city: l.city },
      pieces: (l.pieces || []).filter(p => p.capacite > 0).map(p => ({ id: String(p.id), numero: p.numero, capacite: p.capacite, type: p.type, occupants: p.occupants || [] }))
    };
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    this.locataireService.getAll().subscribe({
      next: (data) => {
        this.locataires.set(data.map(l => this.toview(l)));
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les locataires');
        this.loading.set(false);
      }
    });
    this.logementService.getAll().subscribe({ next: (l) => this.allLogements.set(l.map(x => this.tologement(x))), error: () => {} });
  }

  applyFilters(): void {
    let result = this.locataires();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(l => `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
    }
    if (this.filterStatus) result = result.filter(l => l.status === this.filterStatus);
    this.filteredLocataires.set(result);
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
  onFilterStatus(event: Event): void {
    this.filterStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  roommates(loc: locataireview): locataireview[] {
    if (!loc.logementId) return [];
    return this.locataires().filter(l => l.id !== loc.id && l.logementId === loc.logementId);
  }

  private roomsof(logementId: string) {
    return this.allLogements().find(l => l.id === String(logementId))?.pieces || [];
  }

  private roomid(logementId: string, numero: string): string | undefined {
    return this.roomsof(logementId).find(p => p.numero === numero)?.id;
  }

  openView(loc: locataireview): void { this.viewTarget.set(loc); }

  openEdit(loc: locataireview): void {
    this.editForm = { id: loc.id, firstName: loc.firstName, lastName: loc.lastName, email: loc.email, phone: loc.phone, logementId: loc.logementId, roomNumber: loc.roomNumber || '' };
    this.editRooms.set(this.roomsof(loc.logementId));
    this.showEdit.set(true);
  }
  onEditLogementChange(): void {
    this.editRooms.set(this.roomsof(this.editForm.logementId));
    this.editForm.roomNumber = '';
  }
  saveEdit(): void {
    const f = this.editForm;
    if (!f.firstName || !f.lastName || !f.email) {
      this.toast.warning('Attention', 'Nom, prénom et email sont obligatoires');
      return;
    }
    const payload: Partial<LocataireRequest> = { first_name: f.firstName, last_name: f.lastName, email: f.email };
    if (f.phone) payload.phone = f.phone;
    if (f.logementId) payload.logement_id = f.logementId;
    const piece = f.roomNumber ? this.roomid(f.logementId, f.roomNumber) : undefined;
    if (piece) payload.piece_id = piece;
    this.locataireService.update(f.id, payload).subscribe({
      next: () => {
        this.showEdit.set(false);
        this.toast.success('Locataire modifié', 'Les informations ont été mises à jour');
        this.refresh();
      }
    });
  }

  openInvite(): void {
    this.inviteForm = { firstName: '', lastName: '', email: '', phone: '', logementId: '', roomNumber: '' };
    this.inviteRooms.set([]);
    this.showInvite.set(true);
  }
  onInviteLogementChange(): void {
    this.inviteRooms.set(this.roomsof(this.inviteForm.logementId));
    this.inviteForm.roomNumber = '';
  }
  sendInvitation(): void {
    const f = this.inviteForm;
    if (!f.firstName || !f.lastName || !f.email || !f.phone || !f.logementId) {
      this.toast.warning('Attention', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    const payload: LocataireRequest = { first_name: f.firstName, last_name: f.lastName, email: f.email, phone: f.phone, logement_id: f.logementId };
    const piece = f.roomNumber ? this.roomid(f.logementId, f.roomNumber) : undefined;
    if (piece) payload.piece_id = piece;
    this.locataireService.create(payload).subscribe({
      next: (created) => {
        this.showInvite.set(false);
        this.toast.success('Invitation envoyée', `Un email d'invitation a été envoyé à ${f.email}. Créez maintenant son mot de passe.`);
        this.refresh();
        this.router.navigate(['/proprietaire/locataires', created.id, 'mot-de-passe']);
      }
    });
  }

  askDelete(loc: locataireview): void {
    this.deleteTarget = loc;
    this.showDeleteConfirm.set(true);
  }
  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.locataireService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.showDeleteConfirm.set(false);
        this.deleteTarget = null;
        this.toast.success('Supprimé', 'Le locataire a été supprimé');
        this.refresh();
      },
      error: () => this.showDeleteConfirm.set(false)
    });
  }
}
