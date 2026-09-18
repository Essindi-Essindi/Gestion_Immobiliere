import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { AuthService } from '@core/auth/auth.service';
import { JourPipe, MoisCourtPipe, AnneePipe } from '@shared/pipes';

@Component({
  selector: 'app-echeances',
  standalone: true,
  imports: [RouterModule, JourPipe, MoisCourtPipe, AnneePipe],
  templateUrl: './echeances.component.html'
})
export class EcheancesComponent implements OnInit {
  echeances = signal<any[]>([]);

  constructor(private mockData: MockDataService, private authService: AuthService) {}

  ngOnInit(): void {
    const data = this.mockData.getAll('echeances');
    data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    this.echeances.set(data);
  }

  getEcheanceColor(echeance: any): string {
    if (echeance.status === 'EN_RETARD') return '#000';
    const days = this.getDaysUntilNum(echeance.date);
    if (days <= 30) return '#000';
    if (days <= 90) return '#888';
    return '#ccc';
  }

  getTypeBg(type: string): string {
    switch (type) {
      case 'LOYER': return '#000';
      case 'CONTRAT': return '#555';
      case 'MAINTENANCE': return '#e0e0e0';
      default: return '#f5f5f5';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'LOYER': return '#fff';
      case 'CONTRAT': return '#fff';
      case 'MAINTENANCE': return '#333';
      default: return '#666';
    }
  }

  getDaysUntil(date: Date): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)}j de retard`;
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Demain';
    return `Dans ${diffDays}j`;
  }

  getDaysUntilNum(date: Date): number {
    const now = new Date();
    const d = new Date(date);
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}