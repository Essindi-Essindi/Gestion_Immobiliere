import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EspaceLocataireService } from '@core/services/espace-locataire.service';
import { SignalementResponse, StatutSignalement } from '@core/models/signalement.model';
import { DateFrPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [RouterModule, FormsModule, DateFrPipe, StateBlockComponent],
  templateUrl: './demandes.component.html'
})
export class DemandesComponent implements OnInit {
  demandes = signal<SignalementResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filterStatus = 'all';

  constructor(private espaceLocataireService: EspaceLocataireService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    const status = this.filterStatus === 'all' ? undefined : (this.filterStatus as StatutSignalement);
    this.espaceLocataireService.signalements(status).subscribe({
      next: list => { this.demandes.set(list); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger vos demandes.'); this.loading.set(false); }
    });
  }

  formatStatut(s: StatutSignalement): string {
    const map: Record<StatutSignalement, string> = { NOUVEAU: 'Nouveau', EN_COURS: 'En cours', TERMINE: 'Terminé' };
    return map[s] || s;
  }

  getStatutBg(s: StatutSignalement): string {
    const map: Record<StatutSignalement, string> = { NOUVEAU: '#e0e0e0', EN_COURS: '#f5f5f5', TERMINE: '#000' };
    return map[s] || '#e0e0e0';
  }

  getStatutColor(s: StatutSignalement): string {
    const map: Record<StatutSignalement, string> = { NOUVEAU: '#424242', EN_COURS: '#000', TERMINE: '#fff' };
    return map[s] || '#424242';
  }
}
