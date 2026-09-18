import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '@core/services/mock-data.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@core/services/toast.service';
import { MontantPipe, DateFrPipe } from '@shared/pipes';

@Component({
  selector: 'app-paiements',
  standalone: true,
  imports: [RouterModule, FormsModule, MontantPipe, DateFrPipe],
  templateUrl: './paiements.component.html'
})
export class PaiementsComponent implements OnInit {
  locataire: any = null;
  allPaiements: any[] = [];
  filteredPaiements: any[] = [];
  filterYear = 'all';
  filterStatus = 'all';
  totalPaye = 0;
  totalEnAttente = 0;
  totalEnRetard = 0;
  months = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    this.locataire = this.mockDataService.resolveLocataireForUser(user);
    this.refresh();
  }

  refresh(): void {
    if (!this.locataire) return;
    this.allPaiements = this.mockDataService.getPaiementsForLocataire(this.locataire.id)
      .filter((p: any) => p.type === 'LOYER')
      .sort((a: any, b: any) => (b.year - a.year) || (b.month - a.month));
    this.calculateTotals();
    this.applyFilters();
  }

  calculateTotals(): void {
    this.totalPaye = this.allPaiements.filter(p => p.status === 'PAYE').reduce((sum, p) => sum + p.amount, 0);
    this.totalEnAttente = this.allPaiements.filter(p => p.status === 'EN_ATTENTE').reduce((sum, p) => sum + p.amount, 0);
    this.totalEnRetard = this.allPaiements.filter(p => p.status === 'EN_RETARD').reduce((sum, p) => sum + p.amount, 0);
  }

  applyFilters(): void {
    this.filteredPaiements = this.allPaiements.filter(p => {
      const yearMatch = this.filterYear === 'all' || String(p.year) === this.filterYear;
      const statusMatch = this.filterStatus === 'all' || p.status === this.filterStatus;
      return yearMatch && statusMatch;
    });
  }

  getMonthName(month: number): string {
    return this.months[month] || '';
  }
}
