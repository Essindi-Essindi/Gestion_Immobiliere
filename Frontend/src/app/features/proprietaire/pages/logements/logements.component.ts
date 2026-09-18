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
  template: `
    <div style="padding: 24px; background: #f5f5f5; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 style="margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #000;">Mes Logements</h1>
          <p style="margin: 0; color: #666; font-size: 14px;">Cliquez sur une carte pour voir les pièces et les occupants</p>
        </div>
        <button (click)="openAdd()"
          style="background: #000; color: #fff; border: none; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Ajouter un logement
        </button>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <input (input)="onSearch($event)" placeholder="Rechercher un logement..."
          style="flex: 1; min-width: 200px; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; outline: none; background: #fff;"/>
        <select (change)="onFilterType($event)"
          style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; outline: none; background: #fff;">
          <option value="">Tous les types</option>
          <option value="APPARTEMENT">Appartement</option>
          <option value="MAISON">Maison</option>
          <option value="STUDIO">Studio</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>
        <select (change)="onFilterStatus($event)"
          style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; outline: none; background: #fff;">
          <option value="">Tous les statuts</option>
          <option value="LOUE">Occupé</option>
          <option value="VACANT">Disponible</option>
          <option value="EN_TRAVAUX">En maintenance</option>
        </select>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        @for (logement of filteredLogements(); track logement.id) {
          <div (click)="openDetail(logement)" style="background: #fff; border: 1px solid #e0e0e0; overflow: hidden; cursor: pointer;">
            <div style="height: 150px; background: #e0e0e0; display: flex; align-items: center; justify-content: center;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div style="padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <span [style.background]="getStatusBg(logement.status)" [style.color]="getStatusColor(logement.status)"
                  style="font-size: 11px; padding: 3px 8px; font-weight: 600; text-transform: uppercase;">
                  {{ getStatusLabel(logement.status) }}
                </span>
                <span style="font-size: 11px; color: #999;">{{ logement.type }} - {{ occupancyRate(logement) }}% occ.</span>
              </div>
              <h3 style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #000;">{{ logement.address.street }}</h3>
              <p style="margin: 0 0 12px; font-size: 13px; color: #666;">{{ logement.address.postalCode }} {{ logement.address.city }}</p>
              <div style="display: flex; gap: 16px; margin-bottom: 12px; font-size: 12px; color: #666;">
                <span>{{ logement.surface }} m²</span>
                <span>{{ roomCount(logement) }} pièces</span>
                <span>{{ occupantCount(logement) }} occupant(s)</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #e0e0e0;">
                <span style="font-size: 18px; font-weight: 700; color: #000;">{{ logement.rent | montant }} FCFA</span>
                <span style="display: flex; gap: 6px;">
                  <button (click)="openEdit(logement, $event)" title="Modifier"
                    style="background: #fff; border: 1px solid #e0e0e0; padding: 6px; cursor: pointer; display: flex;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
                  </button>
                  <button (click)="askDelete(logement, $event)" title="Supprimer"
                    style="background: #fff; border: 1px solid #e0e0e0; padding: 6px; cursor: pointer; display: flex;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </span>
              </div>
            </div>
          </div>
        }
      </div>

      @if (filteredLogements().length === 0) {
        <div style="background: #fff; border: 1px solid #e0e0e0; padding: 48px; text-align: center; margin-top: 16px;">
          <p style="margin: 0; color: #666; font-size: 14px;">Aucun logement trouvé</p>
        </div>
      }

      @if (selected()) {
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;" (click)="closeDetail()">
          <div style="background: #fff; width: 100%; max-width: 720px; max-height: 88vh; overflow: auto;" (click)="$event.stopPropagation()">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e0e0e0; position: sticky; top: 0; background: #fff;">
              <div>
                <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #000;">{{ selected().address.street }}</h3>
                <p style="margin: 2px 0 0; font-size: 13px; color: #666;">{{ selected().address.postalCode }} {{ selected().address.city }} - {{ selected().type }} - {{ selected().surface }} m² - {{ selected().rent | montant }} FCFA/mois</p>
              </div>
              <button (click)="closeDetail()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #000; padding: 4px 8px;">✕</button>
            </div>
            <div style="padding: 20px;">
              <h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #000; text-transform: uppercase;">Pièces et occupation</h4>
              <div style="border: 1px solid #e0e0e0;">
                <div style="display: grid; grid-template-columns: 90px 1fr 90px 1fr 110px; gap: 0; background: #f5f5f5; font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase;">
                  <div style="padding: 10px 12px;">N°</div>
                  <div style="padding: 10px 12px;">Type</div>
                  <div style="padding: 10px 12px;">Capacité</div>
                  <div style="padding: 10px 12px;">Occupant(s)</div>
                  <div style="padding: 10px 12px;">Statut</div>
                </div>
                @for (piece of selected().pieces || []; track piece.numero) {
                  <div style="display: grid; grid-template-columns: 90px 1fr 90px 1fr 110px; gap: 0; border-top: 1px solid #e0e0e0; font-size: 13px;">
                    <div style="padding: 10px 12px; font-weight: 700; color: #000;">{{ piece.numero }}</div>
                    <div style="padding: 10px 12px; color: #333;">{{ pieceTypeLabel(piece.type) }}</div>
                    <div style="padding: 10px 12px; color: #333;">{{ piece.capacite === 0 ? '-' : piece.occupants.length + '/' + piece.capacite }}</div>
                    <div style="padding: 10px 12px; color: #333;">
                      @if (piece.occupants.length === 0) {
                        <span style="color: #999;">-</span>
                      } @else {
                        @for (occ of piece.occupants; track occ.locataireId) {
                          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                            <span>{{ occ.nom }}</span>
                            <button (click)="releaseOccupant(piece, occ)" title="Libérer"
                              style="background: #fff; border: 1px solid #e0e0e0; font-size: 10px; padding: 2px 6px; cursor: pointer;">Libérer</button>
                          </div>
                        }
                      }
                    </div>
                    <div style="padding: 10px 12px;">
                      @if (piece.capacite === 0) {
                        <span style="font-size: 11px; padding: 3px 8px; font-weight: 600; background: #f5f5f5; color: #666;">Commun</span>
                      } @else if (piece.occupants.length >= piece.capacite) {
                        <span style="font-size: 11px; padding: 3px 8px; font-weight: 600; background: #000; color: #fff;">Occupé</span>
                      } @else if (piece.occupants.length > 0) {
                        <span style="font-size: 11px; padding: 3px 8px; font-weight: 600; background: #e0e0e0; color: #333;">Partiel</span>
                      } @else {
                        <span style="font-size: 11px; padding: 3px 8px; font-weight: 600; background: #fff; color: #000; border: 1px solid #000;">Libre</span>
                      }
                    </div>
                  </div>
                }
              </div>

              <h4 style="margin: 20px 0 12px; font-size: 14px; font-weight: 700; color: #000; text-transform: uppercase;">Assigner un locataire à une chambre</h4>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <select [(ngModel)]="assignLocId" style="flex: 1; min-width: 160px; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 13px; background: #fff;">
                  <option value="">Choisir un locataire</option>
                  @for (loc of allLocataires(); track loc.id) {
                    <option [value]="loc.id">{{ loc.firstName }} {{ loc.lastName }}{{ loc.roomNumber ? ' (' + loc.roomNumber + ')' : '' }}</option>
                  }
                </select>
                <select [(ngModel)]="assignRoomNum" style="flex: 1; min-width: 140px; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 13px; background: #fff;">
                  <option value="">Choisir une chambre</option>
                  @for (room of freeRooms(selected()); track room.numero) {
                    <option [value]="room.numero">{{ room.numero }} ({{ room.occupants.length }}/{{ room.capacite }})</option>
                  }
                </select>
                <button (click)="doAssign()" style="background: #000; color: #fff; border: none; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;">Assigner</button>
              </div>
            </div>
          </div>
        </div>
      }

      @if (showAdd() || showEdit()) {
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;" (click)="closeForm()">
          <div style="background: #fff; width: 100%; max-width: 680px; max-height: 88vh; overflow: auto;" (click)="$event.stopPropagation()">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e0e0e0; position: sticky; top: 0; background: #fff;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #000;">{{ showAdd() ? 'Ajouter un logement' : 'Modifier le logement' }}</h3>
              <button (click)="closeForm()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #000; padding: 4px 8px;">✕</button>
            </div>
            <div style="padding: 20px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Adresse</label>
                  <input [(ngModel)]="formData.street" placeholder="12 Rue de la Paix" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
                </div>
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Ville</label>
                  <input [(ngModel)]="formData.city" placeholder="Paris" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
                </div>
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Code postal</label>
                  <input [(ngModel)]="formData.postalCode" placeholder="75002" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
                </div>
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Type</label>
                  <select [(ngModel)]="formData.type" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; background: #fff;">
                    <option value="APPARTEMENT">Appartement</option>
                    <option value="MAISON">Maison</option>
                    <option value="STUDIO">Studio</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Surface (m²)</label>
                  <input [(ngModel)]="formData.surface" type="number" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
                </div>
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Loyer (FCFA)</label>
                  <input [(ngModel)]="formData.rent" type="number" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
                </div>
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Charges</label>
                  <input [(ngModel)]="formData.charges" type="number" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
                </div>
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Statut</label>
                  <select [(ngModel)]="formData.status" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; background: #fff;">
                    <option value="LOUE">Occupé</option>
                    <option value="VACANT">Disponible</option>
                    <option value="EN_TRAVAUX">En maintenance</option>
                  </select>
                </div>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #000;">Pièces (chambres, salon, cuisine...)</h4>
                <button (click)="addPieceRow()" style="background: #fff; color: #000; border: 1px solid #000; padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer;">+ Pièce</button>
              </div>
              @for (piece of formPieces; track $index) {
                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                  <input [(ngModel)]="piece.numero" placeholder="CH-1" style="width: 90px; padding: 8px 10px; border: 1px solid #e0e0e0; font-size: 13px; box-sizing: border-box;"/>
                  <select [(ngModel)]="piece.type" style="flex: 1; padding: 8px 10px; border: 1px solid #e0e0e0; font-size: 13px; background: #fff;">
                    <option value="CHAMBRE">Chambre</option>
                    <option value="SALON">Salon</option>
                    <option value="CUISINE">Cuisine</option>
                    <option value="SALLE_DE_BAIN">Salle de bain</option>
                    <option value="BUREAU">Bureau</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                  <input [(ngModel)]="piece.capacite" type="number" min="0" title="Capacité (0 = pièce commune)" style="width: 80px; padding: 8px 10px; border: 1px solid #e0e0e0; font-size: 13px; box-sizing: border-box;"/>
                  <button (click)="removePieceRow($index)" style="background: #fff; border: 1px solid #e0e0e0; padding: 6px 10px; font-size: 12px; cursor: pointer;">✕</button>
                </div>
              }

              <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;">
                <button (click)="closeForm()" style="background: #fff; color: #000; border: 1px solid #e0e0e0; padding: 8px 16px; font-size: 13px; cursor: pointer;">Annuler</button>
                <button (click)="saveForm()" style="background: #000; color: #fff; border: none; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;">Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      }

      @if (showDeleteConfirm()) {
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;" (click)="showDeleteConfirm.set(false)">
          <div style="background: #fff; width: 100%; max-width: 420px; padding: 24px;" (click)="$event.stopPropagation()">
            <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #000;">Supprimer ce logement ?</h3>
            <p style="margin: 0 0 20px; font-size: 14px; color: #666;">Cette action est irréversible.</p>
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
