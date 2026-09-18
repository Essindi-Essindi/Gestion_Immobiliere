import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '@core/services/mock-data.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@core/services/toast.service';
import { MontantPipe, DateFrPipe } from '@shared/pipes';

@Component({
  selector: 'app-quittances',
  standalone: true,
  imports: [FormsModule, MontantPipe, DateFrPipe],
  templateUrl: './quittances.component.html'
})
export class QuittancesComponent implements OnInit {
  locataire: any = null;
  allQuittances: any[] = [];
  filteredQuittances: any[] = [];
  filterYear = 'all';
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
    this.allQuittances = this.mockDataService.getPaiementsForLocataire(this.locataire.id)
      .filter((p: any) => p.type === 'LOYER' && p.status === 'PAYE')
      .sort((a: any, b: any) => (b.year - a.year) || (b.month - a.month));
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredQuittances = this.allQuittances.filter(q =>
      this.filterYear === 'all' || String(q.year) === this.filterYear
    );
  }

  getMonthName(month: number): string {
    return this.months[month] || '';
  }

  telecharger(q: any): void {
    const name = q.quittancePdf ? q.quittancePdf.name : `Quittance_${this.getMonthName(q.month)}_${q.year}.pdf`;
    this.toastService.success('Téléchargement', `${name} en cours de téléchargement`);
  }
}
