import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { MontantPipe } from '@shared/pipes';

@Component({
  selector: 'app-quittances',
  standalone: true,
  imports: [RouterModule, MontantPipe],
  templateUrl: './quittances.component.html'
})
export class QuittancesComponent implements OnInit {
  quittances = signal<any[]>([]);
  filteredQuittances = signal<any[]>([]);
  filterMonth = '';
  pdfView = signal<any>(null);

  countWithReceipt = computed(() => this.filteredQuittances().filter(q => q.status === 'PAYE' && q.quittancePdf).length);
  countPaidNoReceipt = computed(() => this.filteredQuittances().filter(q => q.status === 'PAYE' && !q.quittancePdf).length);
  countUnpaid = computed(() => this.filteredQuittances().filter(q => q.status !== 'PAYE').length);

  groupedQuittances = computed(() => {
    const map = new Map<string, any>();
    for (const q of this.filteredQuittances()) {
      if (q.type !== 'LOYER') continue;
      if (!map.has(q.logementId)) {
        map.set(q.logementId, { logementId: q.logementId, address: q.logementAddress, items: [] });
      }
      map.get(q.logementId).items.push(q);
    }
    return Array.from(map.values());
  });

  constructor(private mockData: MockDataService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const paiements = this.mockData.getAll('paiements');
    this.quittances.set(paiements.filter((p: any) => p.type === 'LOYER'));
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.quittances();
    if (this.filterMonth) result = result.filter(q => q.month === Number(this.filterMonth));
    this.filteredQuittances.set(result);
  }

  onFilterMonth(event: Event): void {
    this.filterMonth = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  getMonthName(month: number): string {
    const months = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return months[month] || '';
  }

  coveredMonths(group: any): string {
    const seen = new Map<string, any>();
    for (const q of group.items) {
      seen.set(q.year + '-' + q.month, q);
    }
    return Array.from(seen.values())
      .sort((a: any, b: any) => (b.year - a.year) || (b.month - a.month))
      .map((q: any) => this.getMonthName(q.month) + ' ' + q.year)
      .join(', ') || '-';
  }

  onInsertPdf(quittance: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    this.mockData.setQuittancePdf(quittance.id, { name: file.name, date: new Date() });
    this.refresh();
    this.toast.success('Quittance insérée', `${file.name} ajouté pour ${quittance.locataireNom}`);
    input.value = '';
  }

  onReplacePdf(quittance: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    this.mockData.setQuittancePdf(quittance.id, { name: file.name, date: new Date() });
    this.refresh();
    this.toast.success('Quittance remplacée', `Nouveau document : ${file.name}`);
    input.value = '';
  }

  removePdf(quittance: any): void {
    this.mockData.removeQuittancePdf(quittance.id);
    this.refresh();
    this.toast.success('Reçu supprimé', 'La quittance PDF a été retirée');
  }

  openPdfView(quittance: any): void { this.pdfView.set(quittance); }

  downloadPdf(): void {
    this.toast.success('Téléchargement', `${this.pdfView().quittancePdf.name} téléchargé`);
    this.pdfView.set(null);
  }

}
