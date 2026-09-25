import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EspaceLocataireService } from '@core/services/espace-locataire.service';
import { PaiementResponse } from '@core/models/espace-locataire.model';
import { StatutLoyer } from '@core/models/loyer.model';
import { MontantPipe, DateFrPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-paiements',
  standalone: true,
  imports: [RouterModule, FormsModule, MontantPipe, DateFrPipe, StateBlockComponent],
  templateUrl: './paiements.component.html'
})
export class PaiementsComponent implements OnInit {
  paiements = signal<PaiementResponse[]>([]);
  totalPaye = signal(0);
  loading = signal(true);
  error = signal<string | null>(null);
  filterYear = 'all';
  filterStatus = 'all';

  years = this.recentYears();
  months = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  totalEnAttente = computed(() => this.paiements().filter(p => p.status === 'EN_ATTENTE').reduce((sum, p) => sum + p.amount, 0));
  totalEnRetard = computed(() => this.paiements().filter(p => p.status === 'EN_RETARD').reduce((sum, p) => sum + p.amount, 0));

  constructor(private espaceLocataireService: EspaceLocataireService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    const year = this.filterYear === 'all' ? undefined : Number(this.filterYear);
    const status = this.filterStatus === 'all' ? undefined : (this.filterStatus as StatutLoyer);
    this.espaceLocataireService.paiements(year, status).subscribe({
      next: res => {
        this.paiements.set(res.items);
        this.totalPaye.set(res.total_paye);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger vos paiements.');
        this.loading.set(false);
      }
    });
  }

  private recentYears(): number[] {
    const current = new Date().getFullYear();
    return [current, current - 1, current - 2];
  }

  periodLabel(period: string): string {
    const [year, month] = period.split('-');
    const idx = Number(month);
    return idx ? `${this.months[idx]} ${year}` : period;
  }
}
