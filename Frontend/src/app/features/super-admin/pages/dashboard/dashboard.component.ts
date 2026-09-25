import { Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminPlateformeService } from '@core/services/admin-plateforme.service';
import { AdminDashboardResponse, RevenuMoisAdmin } from '@core/models/dashboard.model';
import { JournalResponse } from '@core/models/admin.model';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';
import { MontantPipe } from '@shared/pipes';

interface BarItem {
  label: string;
  value: string;
  height: number;
}

const mois_courts = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

interface StatCard {
  label: string;
  value: string;
  icon: string;
}

const icon_bailleurs = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>';
const icon_locataires = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>';
const icon_logements = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
const icon_revenue = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>';
const icon_abonnements = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [StateBlockComponent, MontantPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  stats = signal<StatCard[]>([]);
  barData = signal<BarItem[]>([]);

  // apercu fourni directement par le dashboard, la liste complete est paginee via le journal
  // preview shipped directly by the dashboard, full list is paginated through the journal
  activities = signal<JournalResponse[]>([]);

  showActivityModal = signal(false);
  modalActivities = signal<JournalResponse[]>([]);
  modalLoading = signal(false);
  activityPage = signal(1);
  totalActivityPages = signal(1);
  activityPageSize = 8;

  constructor(private adminPlateforme: AdminPlateformeService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminPlateforme.dashboard().subscribe({
      next: (d) => {
        this.stats.set(this.toCards(d));
        this.barData.set(this.toBars(d.revenus_7_mois));
        this.activities.set(d.activite_recente);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message || 'Impossible de charger le tableau de bord.');
        this.loading.set(false);
      }
    });
  }

  openActivityModal(): void {
    this.showActivityModal.set(true);
    this.loadModalPage(1);
  }

  closeActivityModal(): void {
    this.showActivityModal.set(false);
  }

  loadModalPage(page: number): void {
    this.modalLoading.set(true);
    this.adminPlateforme.journal({ page: page - 1, size: this.activityPageSize }).subscribe({
      next: (res) => {
        this.modalActivities.set(res.content);
        this.activityPage.set(page);
        this.totalActivityPages.set(Math.max(1, res.total_pages));
        this.modalLoading.set(false);
      },
      error: () => this.modalLoading.set(false)
    });
  }

  activityPrev(): void {
    if (this.activityPage() > 1) this.loadModalPage(this.activityPage() - 1);
  }

  activityNext(): void {
    if (this.activityPage() < this.totalActivityPages()) this.loadModalPage(this.activityPage() + 1);
  }

  dotClass(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('creat')) return 'dot-create';
    if (t.includes('suppr') || t.includes('delet')) return 'dot-delete';
    if (t.includes('connex') || t.includes('login')) return 'dot-login';
    return 'dot-update';
  }

  private toBars(serie: RevenuMoisAdmin[]): BarItem[] {
    const max = Math.max(0, ...serie.map(r => r.montant));
    return serie.map(r => ({
      label: mois_courts[Number(r.period.split('-')[1]) - 1] || r.period,
      value: r.montant >= 1000 ? `${Math.round(r.montant / 100) / 10}k€` : `${Math.round(r.montant)}€`,
      // edge case: aucun revenu, on evite la division par zero / no revenue, avoid dividing by zero
      height: max > 0 ? Math.round(r.montant / max * 100) : 0
    }));
  }

  private toCards(d: AdminDashboardResponse): StatCard[] {
    return [
      { label: 'Total Bailleurs', value: String(d.bailleurs.total), icon: icon_bailleurs },
      { label: 'Total Locataires', value: String(d.locataires.total), icon: icon_locataires },
      { label: 'Total Logements', value: String(d.logements), icon: icon_logements },
      { label: 'Revenus du mois', value: `${d.revenus.mois_courant.toLocaleString('fr-FR')} €`, icon: icon_revenue },
      { label: 'Abonnements actifs', value: String(d.abonnements.actifs), icon: icon_abonnements }
    ];
  }
}
