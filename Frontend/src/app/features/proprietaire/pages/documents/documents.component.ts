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
  templateUrl: './documents.component.html'
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