import { Component, OnInit, signal } from '@angular/core';
import { EspaceLocataireService } from '@core/services/espace-locataire.service';
import { ContratService } from '@core/services/contrat.service';
import { ToastService } from '@core/services/toast.service';
import { ContratResponse } from '@core/models/contrat.model';
import { MontantPipe, DateFrPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-contrat',
  standalone: true,
  imports: [MontantPipe, DateFrPipe, StateBlockComponent],
  templateUrl: './contrat.component.html'
})
export class ContratComponent implements OnInit {
  contrat = signal<ContratResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  downloading = signal(false);
  requesting = signal(false);
  showResiliationConfirm = signal(false);

  constructor(
    private espaceLocataireService: EspaceLocataireService,
    private contratService: ContratService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.espaceLocataireService.contrat().subscribe({
      next: c => { this.contrat.set(c); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger votre contrat.'); this.loading.set(false); }
    });
  }

  telechargerContrat(): void {
    const contrat = this.contrat();
    if (!contrat) return;
    this.downloading.set(true);
    this.contratService.pdf(contrat.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        this.downloading.set(false);
      },
      error: () => {
        this.toastService.error('Erreur', 'Le document du contrat est indisponible.');
        this.downloading.set(false);
      }
    });
  }

  askResiliation(): void {
    this.showResiliationConfirm.set(true);
  }

  confirmResiliation(): void {
    this.showResiliationConfirm.set(false);
    this.requesting.set(true);
    this.espaceLocataireService.demanderResiliation().subscribe({
      next: c => {
        this.contrat.set(c);
        this.requesting.set(false);
        this.toastService.success('Demande envoyée', 'Le bailleur a été prévenu de votre demande de résiliation.');
      },
      error: () => {
        this.requesting.set(false);
        this.toastService.error('Erreur', 'Impossible d\'envoyer la demande de résiliation.');
      }
    });
  }
}
