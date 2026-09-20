import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './demandes.component.html'
})
export class DemandesComponent implements OnInit {
  demandes: any[] = [];
  showNewDemande = false;
  newDemande = { titre: '', type: '', description: '' };

  constructor(private mockDataService: MockDataService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.demandes = this.mockDataService.getAll('interventions');
  }

  soumettreDemande(): void {
    if (!this.newDemande.titre || !this.newDemande.type || !this.newDemande.description) {
      this.toastService.warning('Attention', 'Veuillez remplir tous les champs');
      return;
    }
    const result = this.mockDataService.getAll('interventions')[0] || { id: 'new', titre: this.newDemande.titre, description: this.newDemande.description, statut: 'NOUVEAU', dateCreation: new Date().toLocaleDateString('fr-FR') };
    result.titre = this.newDemande.titre;
    result.description = this.newDemande.description;
    this.demandes.unshift(result);
    this.toastService.success('Succès', 'Votre demande a été soumise');
    this.showNewDemande = false;
    this.newDemande = { titre: '', type: '', description: '' };
  }

  formatType(t: string): string {
    const map: Record<string, string> = {
      'demande_de_travaux': 'Demande de travaux',
      'resiliation': 'Résiliation',
      'attestation': 'Attestation',
      'changement_logement': 'Changement de logement'
    };
    return map[t] || t;
  }

  formatStatut(s: string): string {
    const map: Record<string, string> = { 'NOUVEAU': 'En attente', 'EN_COURS': 'En cours', 'RESOLU': 'Acceptée', 'FERME': 'Refusée' };
    return map[s] || s;
  }

  getStatutBg(s: string): string {
    const map: Record<string, string> = { 'NOUVEAU': '#e0e0e0', 'EN_COURS': '#f5f5f5', 'RESOLU': '#000', 'FERME': '#424242' };
    return map[s] || '#e0e0e0';
  }

  getStatutColor(s: string): string {
    const map: Record<string, string> = { 'NOUVEAU': '#424242', 'EN_COURS': '#000', 'RESOLU': '#fff', 'FERME': '#fff' };
    return map[s] || '#424242';
  }
}
