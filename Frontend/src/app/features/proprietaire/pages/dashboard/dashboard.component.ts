import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardService } from '@core/services/dashboard.service';
import { NotificationService } from '@core/services/notification.service';
import { DashboardResponse } from '@core/models/dashboard.model';
import { NotificationResponse } from '@core/models/notification.model';
import { MontantPipe, DateFrPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

interface StatCardData {
  label: string;
  value: string | number;
  icon: 'logements' | 'locataires' | 'money' | 'alert';
  tone: 'primary' | 'info' | 'success' | 'warning';
  trend?: number[];
}

@Component({
  selector: 'app-proprietaire-dashboard',
  standalone: true,
  imports: [
    RouterModule,
    MontantPipe,
    DateFrPipe,
    StateBlockComponent,
    StatCardComponent,
    PageHeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);

  stats = signal<DashboardResponse | null>(null);
  notifications = signal<NotificationResponse[]>([]);

  maxRevenu = computed(() => {
    const revenus = this.stats()?.revenus_6_mois || [];
    return Math.max(...revenus.map(r => r.attendu), 1);
  });

  statsCards = computed<StatCardData[]>(() => {
    const s = this.stats();
    if (!s) return [];

    return [
      {
        label: 'Total Logements',
        value: s.logements.total,
        icon: 'logements',
        tone: 'primary',
        trend: [22, 24, 23, 25, 27, 28, 30]
      },
      {
        label: 'Locataires actifs',
        value: s.locataires.actifs,
        icon: 'locataires',
        tone: 'info',
        trend: [18, 20, 19, 22, 24, 25, 27]
      },
      {
        label: 'Encaissé ce mois',
        value: `${(s.loyers_mois.encaisse || 0).toLocaleString('fr-FR')} €`,
        icon: 'money',
        tone: 'success',
        trend: [120000, 135000, 128000, 142000, 155000, 148000, 162000]
      },
      {
        label: 'Loyers en retard',
        value: s.arrieres.nb_loyers,
        icon: 'alert',
        tone: 'warning',
        trend: [5, 4, 6, 3, 2, 3, 2]
      }
    ];
  });

  showEcheModal = signal(false);
  echePage = signal(1);
  pageSize = 10;
  totalEchePages = computed(() => Math.max(1, Math.ceil((this.stats()?.echeances.length || 0) / this.pageSize)));
  pagedEcheances = computed(() => {
    const start = (this.echePage() - 1) * this.pageSize;
    return (this.stats()?.echeances || []).slice(start, start + this.pageSize);
  });

  showNotifModal = signal(false);
  notifPage = signal(1);
  totalNotifPages = computed(() => Math.max(1, Math.ceil(this.notifications().length / this.pageSize)));
  pagedNotifs = computed(() => {
    const start = (this.notifPage() - 1) * this.pageSize;
    return this.notifications().slice(start, start + this.pageSize);
  });

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.dashboardService.bailleur().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le tableau de bord');
        this.loading.set(false);
      }
    });
    this.notificationService.getAll(undefined, 50).subscribe({ next: (n) => this.notifications.set(n), error: () => {} });
  }

  openEcheModal(): void { this.echePage.set(1); this.showEcheModal.set(true); }
  closeEcheModal(): void { this.showEcheModal.set(false); }
  echePrev(): void { if (this.echePage() > 1) this.echePage.update(p => p - 1); }
  echeNext(): void { if (this.echePage() < this.totalEchePages()) this.echePage.update(p => p + 1); }

  openNotifModal(): void { this.notifPage.set(1); this.showNotifModal.set(true); }
  closeNotifModal(): void { this.showNotifModal.set(false); }
  notifPrev(): void { if (this.notifPage() > 1) this.notifPage.update(p => p - 1); }
  notifNext(): void { if (this.notifPage() < this.totalNotifPages()) this.notifPage.update(p => p + 1); }

  getNotifColor(type: string): string {
    switch (type) {
      case 'WARNING': return '#d9a13b';
      case 'ALERT': return '#a86b3c';
      case 'ERROR': return '#c05640';
      case 'SUCCESS': return '#5e9c62';
      case 'INFO': return '#3b82f6';
      default: return '#b9a893';
    }
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return `${diffDays}j`;
  }
}