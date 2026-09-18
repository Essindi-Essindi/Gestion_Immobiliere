import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-locataires',
  standalone: true,
  imports: [FormsModule, RouterModule],
  template: `
    <div style="padding: 24px; background: #f5f5f5; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 style="margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #000;">Mes Locataires</h1>
          <p style="margin: 0; color: #666; font-size: 14px;">Voir, modifier, supprimer ou inviter un locataire</p>
        </div>
        <button (click)="openInvite()"
          style="background: #000; color: #fff; border: none; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          Inviter un locataire
        </button>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <input (input)="onSearch($event)" placeholder="Rechercher un locataire..."
          style="flex: 1; min-width: 200px; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; outline: none; background: #fff;"/>
        <select (change)="onFilterStatus($event)"
          style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; outline: none; background: #fff;">
          <option value="">Tous les statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Inactif</option>
        </select>
      </div>

      <div style="background: #fff; border: 1px solid #e0e0e0; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5; border-bottom: 1px solid #e0e0e0;">
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Nom</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Email</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Téléphone</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Logement</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Chambre</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Statut</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (locataire of filteredLocataires(); track locataire.id) {
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #000;">{{ locataire.firstName }} {{ locataire.lastName }}</td>
                <td style="padding: 12px 16px; font-size: 13px; color: #333;">{{ locataire.email }}</td>
                <td style="padding: 12px 16px; font-size: 13px; color: #333;">{{ locataire.phone }}</td>
                <td style="padding: 12px 16px; font-size: 13px; color: #333;">{{ locataire.logementAddress }}</td>
                <td style="padding: 12px 16px; font-size: 13px; color: #333;">
                  @if (locataire.roomNumber) {
                    <span style="background: #000; color: #fff; font-size: 11px; padding: 3px 8px; font-weight: 600;">{{ locataire.roomNumber }}</span>
                  } @else {
                    <span style="color: #999;">-</span>
                  }
                </td>
                <td style="padding: 12px 16px;">
                  <span [style.background]="locataire.status === 'ACTIF' ? '#000' : '#e0e0e0'"
                    [style.color]="locataire.status === 'ACTIF' ? '#fff' : '#666'"
                    style="font-size: 11px; padding: 3px 8px; font-weight: 600;">
                    {{ locataire.status === 'ACTIF' ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td style="padding: 12px 16px;">
                  <div style="display: flex; gap: 6px;">
                    <button (click)="openView(locataire)" title="Voir"
                      style="background: #fff; border: 1px solid #e0e0e0; padding: 6px; cursor: pointer; display: flex;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button (click)="openEdit(locataire)" title="Modifier"
                      style="background: #fff; border: 1px solid #e0e0e0; padding: 6px; cursor: pointer; display: flex;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
                    </button>
                    <button (click)="askDelete(locataire)" title="Supprimer"
                      style="background: #fff; border: 1px solid #e0e0e0; padding: 6px; cursor: pointer; display: flex;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (filteredLocataires().length === 0) {
          <div style="padding: 32px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">Aucun locataire trouvé</p>
          </div>
        }
      </div>

      @if (viewTarget()) {
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;" (click)="viewTarget.set(null)">
          <div style="background: #fff; width: 100%; max-width: 560px; max-height: 85vh; overflow: auto;" (click)="$event.stopPropagation()">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e0e0e0;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #000;">{{ viewTarget().firstName }} {{ viewTarget().lastName }}</h3>
              <button (click)="viewTarget.set(null)" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #000; padding: 4px 8px;">✕</button>
            </div>
            <div style="padding: 20px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div><p style="margin: 0 0 2px; font-size: 11px; color: #999; text-transform: uppercase;">Email</p><p style="margin: 0; font-size: 14px; color: #000; font-weight: 500;">{{ viewTarget().email }}</p></div>
                <div><p style="margin: 0 0 2px; font-size: 11px; color: #999; text-transform: uppercase;">Téléphone</p><p style="margin: 0; font-size: 14px; color: #000; font-weight: 500;">{{ viewTarget().phone }}</p></div>
                <div><p style="margin: 0 0 2px; font-size: 11px; color: #999; text-transform: uppercase;">Logement</p><p style="margin: 0; font-size: 14px; color: #000; font-weight: 500;">{{ viewTarget().logementAddress }}</p></div>
                <div><p style="margin: 0 0 2px; font-size: 11px; color: #999; text-transform: uppercase;">Chambre</p><p style="margin: 0; font-size: 14px; color: #000; font-weight: 500;">{{ viewTarget().roomNumber || '-' }}</p></div>
              </div>
              <h4 style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #000; text-transform: uppercase;">Colocataires du même logement</h4>
              @if (roommates(viewTarget()).length === 0) {
                <p style="margin: 0; font-size: 13px; color: #999;">Aucun colocataire.</p>
              } @else {
                @for (mate of roommates(viewTarget()); track mate.id) {
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border: 1px solid #e0e0e0; margin-bottom: 6px;">
                    <span style="font-size: 13px; color: #000; font-weight: 600;">{{ mate.firstName }} {{ mate.lastName }}</span>
                    <span style="font-size: 11px; color: #666;">Chambre {{ mate.roomNumber || '-' }}</span>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }

      @if (showEdit()) {
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;" (click)="showEdit.set(false)">
          <div style="background: #fff; width: 100%; max-width: 560px; max-height: 85vh; overflow: auto;" (click)="$event.stopPropagation()">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e0e0e0;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #000;">Modifier le locataire</h3>
              <button (click)="showEdit.set(false)" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #000; padding: 4px 8px;">✕</button>
            </div>
            <div style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Prénom</label>
                <input [(ngModel)]="editForm.firstName" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Nom</label>
                <input [(ngModel)]="editForm.lastName" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Email</label>
                <input [(ngModel)]="editForm.email" type="email" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Téléphone</label>
                <input [(ngModel)]="editForm.phone" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Logement</label>
                <select [(ngModel)]="editForm.logementId" (change)="onEditLogementChange()" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; background: #fff;">
                  @for (log of allLogements(); track log.id) {
                    <option [value]="log.id">{{ log.address.street }}, {{ log.address.city }}</option>
                  }
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Chambre (si partagé)</label>
                <select [(ngModel)]="editForm.roomNumber" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; background: #fff;">
                  <option value="">Aucune / logement entier</option>
                  @for (room of editRooms(); track room.numero) {
                    <option [value]="room.numero">{{ room.numero }} ({{ room.occupants.length }}/{{ room.capacite }})</option>
                  }
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Statut</label>
                <select [(ngModel)]="editForm.status" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; background: #fff;">
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end; padding: 16px 20px; border-top: 1px solid #e0e0e0;">
              <button (click)="showEdit.set(false)" style="background: #fff; color: #000; border: 1px solid #e0e0e0; padding: 8px 16px; font-size: 13px; cursor: pointer;">Annuler</button>
              <button (click)="saveEdit()" style="background: #000; color: #fff; border: none; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;">Enregistrer</button>
            </div>
          </div>
        </div>
      }

      @if (showInvite()) {
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;" (click)="showInvite.set(false)">
          <div style="background: #fff; width: 100%; max-width: 560px; max-height: 85vh; overflow: auto;" (click)="$event.stopPropagation()">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e0e0e0;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #000;">Inviter un locataire</h3>
              <button (click)="showInvite.set(false)" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #000; padding: 4px 8px;">✕</button>
            </div>
            <div style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Prénom *</label>
                <input [(ngModel)]="inviteForm.firstName" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Nom *</label>
                <input [(ngModel)]="inviteForm.lastName" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Email *</label>
                <input [(ngModel)]="inviteForm.email" type="email" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Téléphone *</label>
                <input [(ngModel)]="inviteForm.phone" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Logement *</label>
                <select [(ngModel)]="inviteForm.logementId" (change)="onInviteLogementChange()" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; background: #fff;">
                  <option value="">Choisir...</option>
                  @for (log of allLogements(); track log.id) {
                    <option [value]="log.id">{{ log.address.street }}, {{ log.address.city }}</option>
                  }
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Chambre (si maison partagée)</label>
                <select [(ngModel)]="inviteForm.roomNumber" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; background: #fff;">
                  <option value="">Logement entier</option>
                  @for (room of inviteRooms(); track room.numero) {
                    <option [value]="room.numero">{{ room.numero }} ({{ room.occupants.length }}/{{ room.capacite }})</option>
                  }
                </select>
              </div>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end; padding: 16px 20px; border-top: 1px solid #e0e0e0;">
              <button (click)="showInvite.set(false)" style="background: #fff; color: #000; border: 1px solid #e0e0e0; padding: 8px 16px; font-size: 13px; cursor: pointer;">Annuler</button>
              <button (click)="sendInvitation()" style="background: #000; color: #fff; border: none; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;">Enregistrer et envoyer l'invitation</button>
            </div>
          </div>
        </div>
      }

      @if (showDeleteConfirm()) {
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;" (click)="showDeleteConfirm.set(false)">
          <div style="background: #fff; width: 100%; max-width: 420px; padding: 24px;" (click)="$event.stopPropagation()">
            <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #000;">Supprimer ce locataire ?</h3>
            <p style="margin: 0 0 20px; font-size: 14px; color: #666;">{{ deleteTarget?.firstName }} {{ deleteTarget?.lastName }} sera retiré et sa chambre libérée.</p>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button (click)="showDeleteConfirm.set(false)" style="background: #fff; color: #000; border: 1px solid #e0e0e0; padding: 8px 16px; font-size: 13px; cursor: pointer;">Annuler</button>
              <button (click)="confirmDelete()" style="background: #000; color: #fff; border: none; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;">Supprimer</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
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
