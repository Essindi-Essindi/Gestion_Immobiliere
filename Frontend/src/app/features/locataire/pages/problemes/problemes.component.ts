import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-problemes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './problemes.component.html'
})
export class ProblemesComponent implements OnInit {
  problems: any[] = [];
  newProblem = { titre: '', description: '', categorie: '', priorite: 'NORMALE' };

  constructor(private mockDataService: MockDataService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.problems = this.mockDataService.getAll('interventions');
  }

  soumettre(): void {
    if (!this.newProblem.titre || !this.newProblem.description || !this.newProblem.categorie) {
      this.toastService.warning('Attention', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    const result = this.mockDataService.submitIntervention(this.newProblem);
    this.problems.unshift(result);
    this.toastService.success('Succès', 'Votre signalement a été soumis avec succès');
    this.newProblem = { titre: '', description: '', categorie: '', priorite: 'NORMALE' };
  }

  formatPriorite(p: string): string {
    const map: Record<string, string> = { 'BASSE': 'Basse', 'NORMALE': 'Moyenne', 'HAUTE': 'Haute', 'URGENTE': 'Urgente' };
    return map[p] || p;
  }

  formatStatut(s: string): string {
    const map: Record<string, string> = { 'NOUVEAU': 'Nouveau', 'EN_COURS': 'En cours', 'RESOLU': 'Résolu', 'FERME': 'Fermé' };
    return map[s] || s;
  }
}
