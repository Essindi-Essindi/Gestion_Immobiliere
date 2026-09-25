import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardService } from '@core/services/dashboard.service';
import { NotificationService } from '@core/services/notification.service';
import { DashboardResponse } from '@core/models/dashboard.model';
import { NotificationResponse } from '@core/models/notification.model';
import { MontantPipe, DateFrPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-proprietaire-dashboard',
  standalone: true,
  imports: [RouterModule, MontantPipe, DateFrPipe, StateBlockComponent],
  templateUrl: './dashboard.component.html'
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
      case 'WARNING': return '#888';
      case 'ALERT': return '#000';
      case 'ERROR': return '#555';
      case 'SUCCESS': return '#333';
      case 'INFO': return '#aaa';
      default: return '#ccc';
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
