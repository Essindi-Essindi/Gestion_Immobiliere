import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="padding:24px;background:#f5f5f5;min-height:100vh;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <div>
          <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:#000;">Mes Demandes</h1>
          <p style="margin:0;color:#757575;font-size:14px;">Suivi de vos demandes administratives</p>
        </div>
        <button (click)="showNewDemande = !showNewDemande" style="padding:12px 24px;background:#000;color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvelle demande
        </button>
      </div>

      @if (showNewDemande) {
        <div style="background:#fff;border:1px solid #e0e0e0;margin-bottom:24px;">
          <div style="padding:16px 20px;border-bottom:1px solid #e0e0e0;">
            <h2 style="margin:0;font-size:16px;font-weight:600;color:#000;">Nouvelle demande</h2>
          </div>
          <div style="padding:20px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;margin-bottom:6px;font-size:13px;color:#616161;font-weight:500;">Titre</label>
                <input type="text" [(ngModel)]="newDemande.titre" placeholder="Ex: Demande d'attestation" style="width:100%;padding:10px 12px;border:1px solid #e0e0e0;font-size:14px;background:#fff;color:#000;box-sizing:border-box;" />
              </div>
              <div>
                <label style="display:block;margin-bottom:6px;font-size:13px;color:#616161;font-weight:500;">Type</label>
                <select [(ngModel)]="newDemande.type" style="width:100%;padding:10px 12px;border:1px solid #e0e0e0;font-size:14px;background:#fff;color:#000;">
                  <option value="">Sélectionner</option>
                  <option value="DEMANDE_DE_TRAVAUX">Demande de travaux</option>
                  <option value="CHANGEMENT_LOGEMENT">Changement de logement</option>
                  <option value="RESILIATION">Résiliation</option>
                  <option value="ATTESTATION">Attestation</option>
                </select>
              </div>
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block;margin-bottom:6px;font-size:13px;color:#616161;font-weight:500;">Description</label>
              <textarea [(ngModel)]="newDemande.description" rows="3" placeholder="Décrivez votre demande..." style="width:100%;padding:10px 12px;border:1px solid #e0e0e0;font-size:14px;background:#fff;color:#000;resize:vertical;box-sizing:border-box;"></textarea>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button (click)="showNewDemande = false" style="padding:10px 20px;background:#fff;color:#616161;border:1px solid #e0e0e0;font-size:14px;font-weight:500;cursor:pointer;">Annuler</button>
              <button (click)="soumettreDemande()" style="padding:10px 24px;background:#000;color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer;">Soumettre</button>
            </div>
          </div>
        </div>
      }

      <div style="background:#fff;border:1px solid #e0e0e0;">
        <div style="padding:16px 20px;border-bottom:1px solid #e0e0e0;">
          <h2 style="margin:0;font-size:16px;font-weight:600;color:#000;">Toutes les demandes</h2>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#fafafa;">
              <th style="padding:12px 20px;text-align:left;font-size:12px;color:#757575;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">Titre</th>
              <th style="padding:12px 20px;text-align:left;font-size:12px;color:#757575;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">Type</th>
              <th style="padding:12px 20px;text-align:left;font-size:12px;color:#757575;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">Statut</th>
              <th style="padding:12px 20px;text-align:left;font-size:12px;color:#757575;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">Date</th>
              <th style="padding:12px 20px;text-align:left;font-size:12px;color:#757575;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">Réponse</th>
            </tr>
          </thead>
          <tbody>
            @for (d of demandes; track d.id) {
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:14px 20px;font-size:14px;color:#000;font-weight:500;">{{ d.titre }}</td>
                <td style="padding:14px 20px;font-size:14px;color:#424242;">{{ formatType(d.type) }}</td>
                <td style="padding:14px 20px;">
                  <span style="padding:4px 12px;font-size:12px;font-weight:600;" [style.background]="getStatutBg(d.statut)" [style.color]="getStatutColor(d.statut)">
                    {{ formatStatut(d.statut) }}
                  </span>
                </td>
                <td style="padding:14px 20px;font-size:14px;color:#424242;">{{ d.dateCreation }}</td>
                <td style="padding:14px 20px;font-size:13px;color:#616161;">{{ d.reponse || '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
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
