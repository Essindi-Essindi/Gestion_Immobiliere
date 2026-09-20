import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { AuthService } from '@core/auth/auth.service';
import { MontantPipe, DateFrPipe } from '@shared/pipes';

@Component({
  selector: 'app-proprietaire-dashboard',
  standalone: true,
  imports: [RouterModule, MontantPipe, DateFrPipe],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  stats = signal<any>({});
  echeances = signal<any[]>([]);
  notifications = signal<any[]>([]);
  revenueData = signal<any[]>([]);
  maxRevenue = computed(() => Math.max(...this.revenueData().map(r => r.value), 1));

  showEcheModal = signal(false);
  echePage = signal(1);
  pageSize = 10;
  totalEchePages = computed(() => Math.max(1, Math.ceil(this.echeances().length / this.pageSize)));
  pagedEcheances = computed(() => {
    const start = (this.echePage() - 1) * this.pageSize;
    return this.echeances().slice(start, start + this.pageSize);
  });

  showNotifModal = signal(false);
  notifPage = signal(1);
  totalNotifPages = computed(() => Math.max(1, Math.ceil(this.notifications().length / this.pageSize)));
  pagedNotifs = computed(() => {
    const start = (this.notifPage() - 1) * this.pageSize;
    return this.notifications().slice(start, start + this.pageSize);
  });

  constructor(private mockData: MockDataService, private authService: AuthService) {}

  ngOnInit(): void {
    this.stats.set(this.mockData.getStats('PROPRIETAIRE'));
    this.echeances.set(this.mockData.getAll('echeances'));
    this.notifications.set(this.mockData.getAll('notifications'));
    this.revenueData.set(this.stats().revenueLast6Months || []);
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

  getTimeAgo(date: Date): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return `${diffDays}j`;
  }
}