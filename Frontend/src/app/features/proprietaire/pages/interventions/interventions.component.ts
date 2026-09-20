import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { MontantPipe, DateFrPipe } from '@shared/pipes';

@Component({
  selector: 'app-interventions',
  standalone: true,
  imports: [RouterModule, MontantPipe, DateFrPipe],
  templateUrl: './interventions.component.html'
})
export class InterventionsComponent implements OnInit {
  interventions = signal<any[]>([]);
  filteredInterventions = signal<any[]>([]);
  filterStatus = '';
  filterCategory = '';
  viewTarget = signal<any>(null);

  constructor(private mockData: MockDataService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.interventions.set(this.mockData.getAll('interventions'));
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.interventions();
    if (this.filterStatus) result = result.filter(i => i.status === this.filterStatus);
    if (this.filterCategory) result = result.filter(i => i.category === this.filterCategory);
    this.filteredInterventions.set(result);
  }

  onFilterStatus(event: Event): void {
    this.filterStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onFilterCategory(event: Event): void {
    this.filterCategory = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminée';
      case 'NOUVEAU': return 'Nouveau';
      default: return status;
    }
  }

  getStatusBg(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return '#e0e0e0';
      case 'EN_COURS': return '#000';
      case 'TERMINE': return '#f5f5f5';
      default: return '#fff';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return '#333';
      case 'EN_COURS': return '#fff';
      case 'TERMINE': return '#666';
      default: return '#000';
    }
  }

  openView(intervention: any): void { this.viewTarget.set(intervention); }

  markInProgress(intervention: any): void {
    this.mockData.update('interventions', intervention.id, { status: 'EN_COURS' });
    this.refresh();
    this.toast.success('Intervention en cours', `"${intervention.title}" est maintenant en cours`);
  }

  markComplete(intervention: any): void {
    this.mockData.update('interventions', intervention.id, { status: 'TERMINE' });
    this.refresh();
    this.toast.success('Intervention terminée', `"${intervention.title}" marquée comme terminée`);
  }

}
