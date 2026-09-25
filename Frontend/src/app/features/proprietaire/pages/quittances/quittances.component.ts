import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, switchMap } from 'rxjs';
import { QuittanceService } from '@core/services/quittance.service';
import { LoyerService } from '@core/services/loyer.service';
import { ToastService } from '@core/services/toast.service';
import { MontantPipe, DateFrPipe } from '@shared/pipes';
import { QuittanceResponse } from '@core/models/quittance.model';
import { DocumentResponse } from '@core/models/document.model';

// une ligne = un loyer, avec sa quittance si elle existe / one row = one rent, with its receipt if any
interface row {
  id: string; logementId: string; logementAddress: string; locataireNom: string; roomNumber: string;
  period: string; month: number; year: number; amount: number; status: string;
  quittancePdf: { name: string } | null; quittance: QuittanceResponse | null;
}

@Component({
  selector: 'app-quittances',
  standalone: true,
  imports: [RouterModule, FormsModule, MontantPipe, DateFrPipe],
  templateUrl: './quittances.component.html'
})
export class QuittancesComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);

  rows = signal<row[]>([]);
  filterPeriod = signal('');

  periods = computed(() => Array.from(new Set(this.rows().map(r => r.period))).sort().reverse());

  filteredQuittances = computed(() => {
    const p = this.filterPeriod();
    return p ? this.rows().filter(r => r.period === p) : this.rows();
  });

  countWithReceipt = computed(() => this.filteredQuittances().filter(q => q.status === 'PAYE' && q.quittancePdf).length);
  countPaidNoReceipt = computed(() => this.filteredQuittances().filter(q => q.status === 'PAYE' && !q.quittancePdf).length);
  countUnpaid = computed(() => this.filteredQuittances().filter(q => q.status !== 'PAYE').length);

  groupedQuittances = computed(() => {
    const map = new Map<string, { logementId: string; address: string; items: row[] }>();
    for (const q of this.filteredQuittances()) {
      if (!map.has(q.logementId)) map.set(q.logementId, { logementId: q.logementId, address: q.logementAddress, items: [] });
      map.get(q.logementId)!.items.push(q);
    }
    return Array.from(map.values());
  });

  docView = signal<any>(null);
  insertTarget: row | null = null;

  constructor(
    private quittanceService: QuittanceService,
    private loyerService: LoyerService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ quittances: this.quittanceService.getAll(), loyers: this.loyerService.getAll(), inserted: this.quittanceService.inserted() }).subscribe({
      next: ({ quittances, loyers, inserted }) => {
        const ins = new Set(inserted.map(String));
        this.rows.set(loyers.map(l => {
          const q = quittances.find(x => String(x.contrat_id) === String(l.contrat_id) && x.period === l.period) || null;
          const [y, m] = l.period.split('-');
          return {
            id: String(l.id), logementId: String(l.logement_id), logementAddress: l.logement_address,
            locataireNom: l.locataire_name, roomNumber: l.piece_numero || '', period: l.period,
            month: Number(m), year: Number(y), amount: l.amount, status: l.status,
            quittancePdf: q && ins.has(String(q.id)) ? { name: 'Quittance ' + l.period + '.pdf' } : null, quittance: q
          };
        }).sort((a, b) => b.period.localeCompare(a.period)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les quittances');
        this.loading.set(false);
      }
    });
  }

  monthlabel(period: string): string {
    const [y, m] = period.split('-');
    const names = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return (names[Number(m) - 1] || period) + ' ' + y;
  }

  getMonthName(month: number): string {
    return this.monthlabel('2000-' + String(month).padStart(2, '0')).split(' ')[0];
  }

  coveredMonths(group: { items: row[] }): string {
    const seen = new Map<string, row>();
    for (const q of group.items) if (q.quittancePdf) seen.set(q.period, q);
    return Array.from(seen.values()).map(q => this.getMonthName(q.month) + ' ' + q.year).join(', ') || '-';
  }

  onFilterMonth(event: Event): void {
    this.filterPeriod.set((event.target as HTMLSelectElement).value);
  }

  pick(r: row, picker: HTMLInputElement): void {
    this.insertTarget = r;
    picker.value = '';
    picker.click();
  }

  onfile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const r = this.insertTarget;
    if (!file || !r) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.toast.warning('Attention', 'Le fichier doit être un PDF');
      return;
    }
    // edge case: pas encore de quittance pour ce loyer, on la cree avant d'y inserer le fichier / no receipt yet, create it first
    const quittance$ = r.quittance ? of(r.quittance) : this.loyerService.receipt(r.id);
    quittance$.pipe(switchMap(q => this.quittanceService.insert(q.id, file))).subscribe({
      next: () => {
        this.toast.success('Quittance insérée', `Quittance de ${r.locataireNom} - ${this.monthlabel(r.period)}`);
        this.refresh();
      },
      error: () => this.toast.error('Erreur', "Impossible d'insérer la quittance")
    });
  }

  openPdfView(r: row): void {
    if (!r.quittance) return;
    this.quittanceService.pdf(r.quittance.id).subscribe({
      next: (blob) => window.open(URL.createObjectURL(blob))
    });
  }

  downloadPdf(): void {
    const r: row | undefined = this.docView()?.row;
    if (!r?.quittance) return;
    this.quittanceService.pdf(r.quittance.id).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = r.quittancePdf?.name || 'quittance.pdf';
        a.click();
      }
    });
  }

  openDocument(r: row): void {
    if (!r.quittance) return;
    this.docView.set({ row: r, doc: null as DocumentResponse | null, loading: true });
    this.quittanceService.document(r.quittance.id).subscribe({
      next: (doc) => this.docView.set({ row: r, doc, loading: false }),
      error: () => this.docView.set({ row: r, doc: null, loading: false })
    });
  }
  closeDocument(): void { this.docView.set(null); }
}
