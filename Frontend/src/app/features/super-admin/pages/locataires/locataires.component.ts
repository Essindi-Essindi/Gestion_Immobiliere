import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminUtilisateursService } from '@core/services/admin-utilisateurs.service';
import { AdminLocataireResponse } from '@core/models/admin.model';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-locataires',
  standalone: true,
  imports: [FormsModule, StateBlockComponent],
  templateUrl: './locataires.component.html',
  styleUrl: './locataires.component.scss'
})
export class LocatairesComponent implements OnInit {
  searchTerm = '';
  statusFilter = signal('Tous');
  selectedLocataire = signal<AdminLocataireResponse | null>(null);

  locataires = signal<AdminLocataireResponse[]>([]);
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
    this.adminUtilisateurs.locataires(status, this.searchTerm || undefined).subscribe({
      next: (list) => {
        this.locataires.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message || 'Impossible de charger les locataires.');
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

  viewDetails(l: AdminLocataireResponse): void {
    this.selectedLocataire.set(l);
  }

  closeModal(): void {
    this.selectedLocataire.set(null);
  }

  toggleStatus(l: AdminLocataireResponse): void {
    this.actionMsg.set('');
    const action = l.status === 'ACTIF'
      ? this.adminUtilisateurs.suspendLocataire(l.id)
      : this.adminUtilisateurs.activateLocataire(l.id);
    action.subscribe({
      next: () => this.loadList(),
      error: (err: HttpErrorResponse) => this.actionMsg.set(err.error?.message || 'Action impossible.')
    });
  }
}
