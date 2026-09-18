import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@core/services/toast.service';
import { DateFrPipe } from '@shared/pipes';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [RouterModule, DateFrPipe],
  template: `
    <div style="padding: 24px; background: #f5f5f5; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 style="margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #000;">Documents</h1>
          <p style="margin: 0; color: #666; font-size: 14px;">Stockage et gestion des documents</p>
        </div>
        <button (click)="showUpload.set(!showUpload())"
          style="background: #000; color: #fff; border: none; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Uploader un document
        </button>
      </div>

      <!-- Upload Area -->
      @if (showUpload()) {
        <div style="background: #fff; border: 2px dashed #e0e0e0; padding: 40px; margin-bottom: 24px; text-align: center;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5" style="margin-bottom: 12px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <p style="margin: 0 0 8px; font-size: 14px; color: #666;">Glissez vos fichiers ici ou</p>
          <button (click)="simulateUpload()"
            style="background: #000; color: #fff; border: none; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer;">Parcourir</button>
        </div>
      }

      <!-- Filters -->
      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <select (change)="onFilterType($event)"
          style="padding: 8px 12px; border: 1px solid #e0e0e0; font-size: 14px; outline: none; background: #fff;">
          <option value="">Tous les types</option>
          <option value="Contrat">Contrat</option>
          <option value="Quittance">Quittance</option>
          <option value="Diagnostic">Diagnostic</option>
          <option value="Autre">Autre</option>
        </select>
      </div>

      <!-- Documents Table -->
      <div style="background: #fff; border: 1px solid #e0e0e0; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5; border-bottom: 1px solid #e0e0e0;">
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Nom</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Type</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Date</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Taille</th>
              <th style="padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (doc of filteredDocuments(); track doc.id) {
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 12px 16px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 32px; height: 32px; background: #f5f5f5; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <span style="font-size: 14px; font-weight: 600; color: #000;">{{ doc.name }}</span>
                  </div>
                </td>
                <td style="padding: 12px 16px;">
                  <span [style.background]="getTypeBg(doc.type)"
                    [style.color]="getTypeColor(doc.type)"
                    style="font-size: 11px; padding: 3px 8px; font-weight: 600;">
                    {{ doc.type }}
                  </span>
                </td>
                <td style="padding: 12px 16px; font-size: 13px; color: #333;">{{ doc.date | dateFr }}</td>
                <td style="padding: 12px 16px; font-size: 13px; color: #666;">{{ doc.taille }}</td>
                <td style="padding: 12px 16px;">
                  <div style="display: flex; gap: 6px;">
                    <button (click)="downloadDoc(doc)"
                      style="background: #fff; color: #000; border: 1px solid #e0e0e0; padding: 4px 10px; font-size: 12px; cursor: pointer; font-weight: 600;">Télécharger</button>
                    <button (click)="deleteDoc(doc)"
                      style="background: #fff; color: #000; border: 1px solid #e0e0e0; padding: 4px 10px; font-size: 12px; cursor: pointer; font-weight: 600;">Supprimer</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (filteredDocuments().length === 0) {
          <div style="padding: 32px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">Aucun document trouvé</p>
          </div>
        }
      </div>
    </div>
  `
})
export class DocumentsComponent implements OnInit {
  documents = signal<any[]>([]);
  filteredDocuments = signal<any[]>([]);
  showUpload = signal(false);
  filterType = '';

  constructor(private mockData: MockDataService, private authService: AuthService, private toast: ToastService) {}

  ngOnInit(): void {
    this.documents.set(this.mockData.getAll('documents'));
    this.filteredDocuments.set(this.documents());
  }

  applyFilters(): void {
    let result = this.documents();
    if (this.filterType) {
      result = result.filter(d => d.type === this.filterType);
    }
    this.filteredDocuments.set(result);
  }

  onFilterType(event: Event): void {
    this.filterType = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  getTypeBg(type: string): string {
    switch (type) {
      case 'Contrat': return '#000';
      case 'Quittance': return '#555';
      case 'Diagnostic': return '#e0e0e0';
      case 'Autre': return '#f5f5f5';
      default: return '#f5f5f5';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'Contrat': return '#fff';
      case 'Quittance': return '#fff';
      case 'Diagnostic': return '#333';
      case 'Autre': return '#666';
      default: return '#333';
    }
  }

  downloadDoc(doc: any): void {
    this.toast.success('Téléchargement', `Téléchargement de "${doc.name}" en cours...`);
  }

  deleteDoc(doc: any): void {
    this.documents.update(list => list.filter(d => d.id !== doc.id));
    this.applyFilters();
    this.toast.success('Document supprimé', `"${doc.name}" a été supprimé`);
  }

  simulateUpload(): void {
    const newDoc = {
      id: String(this.documents().length + 1),
      name: 'Nouveau_Document.pdf',
      type: 'Autre',
      date: new Date(),
      taille: '150 Ko'
    };
    this.documents.update(list => [...list, newDoc]);
    this.applyFilters();
    this.showUpload.set(false);
    this.toast.success('Document uploadé', 'Le document a été ajouté avec succès');
  }
}