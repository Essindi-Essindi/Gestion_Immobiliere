import { Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminPlateformeService } from '@core/services/admin-plateforme.service';
import { AdminDashboardResponse, RevenuMoisAdmin } from '@core/models/dashboard.model';
import { JournalResponse } from '@core/models/admin.model';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';
import { MontantPipe } from '@shared/pipes';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

interface BarItem {
  label: string;
  value: string;
  height: number;
}

const mois_courts = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

interface StatCardData {
  label: string;
  value: string;
  icon: 'bailleurs' | 'locataires' | 'logements' | 'revenue' | 'abonnements';
  tone: 'primary' | 'success' | 'info' | 'warning' | 'muted';
  change?: string;
  changeValue?: number;
  trend?: number[];
}

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [StateBlockComponent, MontantPipe, StatCardComponent, PageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  stats = signal<StatCardData[]>([]);
  barData = signal<BarItem[]>([]);

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
      height: max > 0 ? Math.round(r.montant / max * 100) : 0
    }));
  }

  private toCards(d: AdminDashboardResponse): StatCardData[] {
    return [
      { 
        label: 'Total Bailleurs', 
        value: String(d.bailleurs.total), 
        icon: 'bailleurs', 
        tone: 'primary',
        trend: [12, 15, 13, 18, 22, 25, 28]
      },
      { 
        label: 'Total Locataires', 
        value: String(d.locataires.total), 
        icon: 'locataires', 
        tone: 'info',
        trend: [85, 92, 88, 95, 102, 110, 118]
      },
      { 
        label: 'Total Logements', 
        value: String(d.logements), 
        icon: 'logements', 
        tone: 'muted',
        trend: [24, 26, 25, 28, 30, 32, 34]
      },
      { 
        label: 'Revenus du mois', 
        value: `${d.revenus.mois_courant.toLocaleString('fr-FR')} €`, 
        icon: 'revenue', 
        tone: 'success',
        trend: [45, 52, 48, 55, 62, 58, 65]
      },
      { 
        label: 'Abonnements actifs', 
        value: String(d.abonnements.actifs), 
        icon: 'abonnements', 
        tone: 'warning',
        trend: [156, 162, 158, 165, 172, 178, 184]
      }
    ];
  }
}