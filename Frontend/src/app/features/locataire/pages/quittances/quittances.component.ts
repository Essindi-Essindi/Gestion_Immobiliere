import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EspaceLocataireService } from '@core/services/espace-locataire.service';
import { QuittanceService } from '@core/services/quittance.service';
import { ToastService } from '@core/services/toast.service';
import { QuittanceLocataireResponse } from '@core/models/espace-locataire.model';
import { MontantPipe, DateFrPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-quittances',
  standalone: true,
  imports: [FormsModule, MontantPipe, DateFrPipe, StateBlockComponent],
  templateUrl: './quittances.component.html'
})
export class QuittancesComponent implements OnInit {
  quittances = signal<QuittanceLocataireResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  downloadingId = signal<string | null>(null);
  filterYear = 'all';

  years = this.recentYears();
  months = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  constructor(
    private espaceLocataireService: EspaceLocataireService,
    private quittanceService: QuittanceService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    const year = this.filterYear === 'all' ? undefined : Number(this.filterYear);
    this.espaceLocataireService.quittances(year).subscribe({
      next: q => { this.quittances.set(q); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger vos quittances.'); this.loading.set(false); }
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

  telecharger(q: QuittanceLocataireResponse): void {
    this.downloadingId.set(q.id);
    this.quittanceService.pdf(q.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        this.downloadingId.set(null);
      },
      error: () => {
        this.toastService.error('Erreur', 'Cette quittance est indisponible.');
        this.downloadingId.set(null);
      }
    });
  }
}
