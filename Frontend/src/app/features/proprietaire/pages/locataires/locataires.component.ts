import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-locataires',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './locataires.component.html'
})
export class LocatairesComponent implements OnInit {
  locataires = signal<any[]>([]);
  filteredLocataires = signal<any[]>([]);
  allLogements = signal<any[]>([]);
  searchQuery = '';
  filterStatus = '';

  viewTarget = signal<any>(null);
  showEdit = signal(false);
  showInvite = signal(false);
  showDeleteConfirm = signal(false);
  deleteTarget: any = null;

  editForm: any = {};
  editRooms = signal<any[]>([]);
  inviteForm: any = { firstName: '', lastName: '', email: '', phone: '', logementId: '', roomNumber: '' };
  inviteRooms = signal<any[]>([]);

  constructor(private mockData: MockDataService, private toast: ToastService, private router: Router) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.locataires.set(this.mockData.getAll('locataires'));
    this.allLogements.set(this.mockData.getAll('logements'));
    this.applyFilters();
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

  roommates(loc: any): any[] {
    return this.locataires().filter(l => l.id !== loc.id && l.logementId === loc.logementId);
  }

  openView(loc: any): void { this.viewTarget.set(loc); }

  openEdit(loc: any): void {
    this.editForm = { id: loc.id, firstName: loc.firstName, lastName: loc.lastName, email: loc.email, phone: loc.phone, logementId: loc.logementId, roomNumber: loc.roomNumber || '', status: loc.status };
    this.editRooms.set(this.mockData.getPiecesForAssign(loc.logementId));
    this.showEdit.set(true);
  }
  onEditLogementChange(): void {
    this.editRooms.set(this.mockData.getPiecesForAssign(this.editForm.logementId));
    this.editForm.roomNumber = '';
  }
  saveEdit(): void {
    if (!this.editForm.firstName || !this.editForm.lastName || !this.editForm.email) {
      this.toast.warning('Attention', 'Nom, prénom et email sont obligatoires');
      return;
    }
    this.mockData.updateLocataire(this.editForm.id, {
      firstName: this.editForm.firstName, lastName: this.editForm.lastName,
      email: this.editForm.email, phone: this.editForm.phone,
      logementId: this.editForm.logementId, roomNumber: this.editForm.roomNumber,
      status: this.editForm.status
    });
    this.showEdit.set(false);
    this.refresh();
    this.toast.success('Locataire modifié', 'Les informations ont été mises à jour');
  }

  openInvite(): void {
    this.inviteForm = { firstName: '', lastName: '', email: '', phone: '', logementId: '', roomNumber: '' };
    this.inviteRooms.set([]);
    this.showInvite.set(true);
  }
  onInviteLogementChange(): void {
    this.inviteRooms.set(this.mockData.getPiecesForAssign(this.inviteForm.logementId));
    this.inviteForm.roomNumber = '';
  }
  sendInvitation(): void {
    const f = this.inviteForm;
    if (!f.firstName || !f.lastName || !f.email || !f.phone || !f.logementId) {
      this.toast.warning('Attention', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    const created = this.mockData.inviteLocataire(f);
    this.showInvite.set(false);
    this.refresh();
    this.toast.success('Invitation envoyée', `Un email d'invitation a été envoyé à ${f.email}. Créez maintenant son mot de passe.`);
    this.router.navigate(['/proprietaire/locataires', created.id, 'mot-de-passe']);
  }

  askDelete(loc: any): void {
    this.deleteTarget = loc;
    this.showDeleteConfirm.set(true);
  }
  confirmDelete(): void {
    this.mockData.deleteLocataire(this.deleteTarget.id);
    this.showDeleteConfirm.set(false);
    this.deleteTarget = null;
    this.refresh();
    this.toast.success('Supprimé', 'Le locataire a été supprimé');
  }
}
