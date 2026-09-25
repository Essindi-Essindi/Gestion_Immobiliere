import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SignalementService } from '@core/services/signalement.service';
import { ToastService } from '@core/services/toast.service';
import { DateFrPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';
import { SignalementResponse, StatutSignalement } from '@core/models/signalement.model';

@Component({
  selector: 'app-interventions',
  standalone: true,
  imports: [RouterModule, FormsModule, DateFrPipe, StateBlockComponent],
  templateUrl: './interventions.component.html'
})
export class InterventionsComponent implements OnInit, OnDestroy {
  loading = signal(true);
  error = signal<string | null>(null);

  interventions = signal<SignalementResponse[]>([]);
  filterStatus: StatutSignalement | '' = '';
  filterCategory = signal('');
  categories = computed(() => Array.from(new Set(this.interventions().map(i => i.category).filter(Boolean))).sort());
  shown = computed(() => this.filterCategory() ? this.interventions().filter(i => i.category === this.filterCategory()) : this.interventions());
  viewTarget = signal<SignalementResponse | null>(null);
  responseText = '';

  constructor(private signalementService: SignalementService, private toast: ToastService) {}

  // nouveaux signalements des locataires sans recharger / tenants' new reports without reloading
  private pollHandle: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.refresh();
    this.pollHandle = setInterval(() => this.refresh(true), 20000);
  }

  ngOnDestroy(): void {
    if (this.pollHandle) clearInterval(this.pollHandle);
  }

  refresh(silent = false): void {
    if (!silent) this.loading.set(true);
    this.error.set(null);
    this.signalementService.getAll(this.filterStatus || undefined).subscribe({
      next: (data) => {
        this.interventions.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les signalements');
        this.loading.set(false);
      }
    });
  }

  onFilterCategory(event: Event): void {
    this.filterCategory.set((event.target as HTMLSelectElement).value);
  }

  onFilterStatus(event: Event): void {
    this.filterStatus = (event.target as HTMLSelectElement).value as StatutSignalement | '';
    this.refresh();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'NOUVEAU': return 'Nouveau';
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      default: return status;
    }
  }
  getStatusBg(status: string): string {
    switch (status) {
      case 'NOUVEAU': return '#e0e0e0';
      case 'EN_COURS': return '#000';
      case 'TERMINE': return '#f5f5f5';
      default: return '#fff';
    }
  }
  getStatusColor(status: string): string {
    switch (status) {
      case 'NOUVEAU': return '#333';
      case 'EN_COURS': return '#fff';
      case 'TERMINE': return '#666';
      default: return '#000';
    }
  }

  openView(item: SignalementResponse): void {
    this.responseText = item.response || '';
    this.viewTarget.set(item);
  }
  closeView(): void { this.viewTarget.set(null); }

  markInProgress(item: SignalementResponse): void {
    this.signalementService.process(item.id, { response: this.responseText || undefined }).subscribe({
      next: () => {
        this.toast.success('Signalement en cours', `"${item.title}" est maintenant en cours`);
        this.closeView();
        this.refresh();
      },
      error: () => this.toast.error('Erreur', 'Impossible de mettre à jour le signalement')
    });
  }

  markComplete(item: SignalementResponse): void {
    this.signalementService.close(item.id, { response: this.responseText || undefined }).subscribe({
      next: () => {
        this.toast.success('Signalement fermé', `"${item.title}" marqué comme fermé`);
        this.closeView();
        this.refresh();
      },
      error: () => this.toast.error('Erreur', 'Impossible de fermer le signalement')
    });
  }
}
