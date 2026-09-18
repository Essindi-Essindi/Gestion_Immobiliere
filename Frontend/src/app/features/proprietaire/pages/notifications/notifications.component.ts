import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  notifications = signal<any[]>([]);
  filter = signal<'all' | 'unread'>('all');
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);
  displayedNotifications = computed(() => {
    if (this.filter() === 'unread') {
      return this.notifications().filter(n => !n.isRead);
    }
    return this.notifications();
  });

  constructor(private mockData: MockDataService, private authService: AuthService) {}

  ngOnInit(): void {
    this.notifications.set(this.mockData.getAll('notifications'));
  }

  markAllRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
  }

  getNotifIconBg(type: string): string {
    switch (type) {
      case 'WARNING': return '#f5f5f5';
      case 'ALERT': return '#000';
      case 'ERROR': return '#e0e0e0';
      case 'SUCCESS': return '#f5f5f5';
      case 'INFO': return '#f5f5f5';
      default: return '#f5f5f5';
    }
  }

  getNotifIconColor(type: string): string {
    switch (type) {
      case 'WARNING': return '#555';
      case 'ALERT': return '#fff';
      case 'ERROR': return '#333';
      case 'SUCCESS': return '#333';
      case 'INFO': return '#666';
      default: return '#666';
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
