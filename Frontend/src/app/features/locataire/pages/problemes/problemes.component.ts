import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EspaceLocataireService } from '@core/services/espace-locataire.service';
import { ToastService } from '@core/services/toast.service';
import { NouveauSignalementRequest, SignalementResponse, StatutSignalement } from '@core/models/signalement.model';
import { DateFrPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-problemes',
  standalone: true,
  imports: [RouterModule, FormsModule, DateFrPipe, StateBlockComponent],
  templateUrl: './problemes.component.html'
})
export class ProblemesComponent implements OnInit {
  problems = signal<SignalementResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  newProblem: NouveauSignalementRequest = { title: '', description: '', category: '' };

  constructor(private espaceLocataireService: EspaceLocataireService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.espaceLocataireService.signalements().subscribe({
      next: list => { this.problems.set(list.slice(0, 5)); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger vos signalements.'); this.loading.set(false); }
    });
  }

  soumettre(): void {
    if (!this.newProblem.title || !this.newProblem.description || !this.newProblem.category) {
      this.toastService.warning('Attention', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    this.submitting.set(true);
    this.espaceLocataireService.newSignalement(this.newProblem).subscribe({
      next: () => {
        this.toastService.success('Succès', 'Votre signalement a été soumis avec succès');
        this.newProblem = { title: '', description: '', category: '' };
        this.submitting.set(false);
        this.refresh();
      },
      error: () => {
        this.toastService.error('Erreur', "Votre signalement n'a pas pu être envoyé.");
        this.submitting.set(false);
      }
    });
  }

  formatStatut(s: StatutSignalement): string {
    const map: Record<StatutSignalement, string> = { NOUVEAU: 'Nouveau', EN_COURS: 'En cours', TERMINE: 'Terminé' };
    return map[s] || s;
  }
}
