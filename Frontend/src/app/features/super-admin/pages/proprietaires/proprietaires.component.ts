import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminUtilisateursService } from '@core/services/admin-utilisateurs.service';
import { AdminBailleurResponse } from '@core/models/admin.model';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-proprietaires',
  standalone: true,
  imports: [FormsModule, StateBlockComponent],
  templateUrl: './proprietaires.component.html',
  styleUrl: './proprietaires.component.scss'
})
export class ProprietairesComponent implements OnInit {
  searchTerm = '';
  statusFilter = signal('Tous');
  selectedProp = signal<AdminBailleurResponse | null>(null);

  proprietaires = signal<AdminBailleurResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  actionMsg = signal('');

  constructor(private adminUtilisateurs: AdminUtilisateursService) {}

  ngOnInit(): void {
    this.loadList();
  }

  loadList(): void {
    this.loading.set(true);
    this.error.set(null);
    const status = this.statusFilter() === 'Tous' ? undefined : this.statusFilter() === 'Actif' ? 'ACTIF' : 'SUSPENDU';
    this.adminUtilisateurs.bailleurs(status, this.searchTerm || undefined).subscribe({
      next: (list) => {
        this.proprietaires.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message || 'Impossible de charger les propriétaires.');
        this.loading.set(false);
      }
    });
  }

  filterList(): void {
    this.loadList();
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.loadList();
  }

  viewDetails(p: AdminBailleurResponse): void {
    // recharge en detail : la liste peut ne pas inclure le detail des biens / detail fetch: the list may omit the properties breakdown
    this.adminUtilisateurs.bailleur(p.id).subscribe({
      next: (full) => this.selectedProp.set(full),
      error: () => this.selectedProp.set(p)
    });
  }

  occupants(piece: { capacite: number; occupants: { nom: string }[] }): string {
    if (piece.capacite === 0) return 'Commune';
    return piece.occupants.length ? piece.occupants.map(o => o.nom).join(', ') : 'Libre';
  }

  closeModal(): void {
    this.selectedProp.set(null);
  }

  toggleStatus(p: AdminBailleurResponse): void {
    this.actionMsg.set('');
    const action = p.status === 'ACTIF'
      ? this.adminUtilisateurs.suspendBailleur(p.id)
      : this.adminUtilisateurs.activateBailleur(p.id);
    action.subscribe({
      next: () => this.loadList(),
      error: (err: HttpErrorResponse) => this.actionMsg.set(err.error?.message || 'Action impossible.')
    });
  }
}
