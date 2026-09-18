import { Component, OnInit, signal, computed } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';

interface Notification {
  id: number;
  icon: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

@Component({
  selector: 'app-notifications',
  standalone: true,
templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  filter = signal('Tous');

  notifications = signal<Notification[]>([]);

  constructor(private mockData: MockDataService) {}

  ngOnInit(): void {
    this.notifications.set(
      this.mockData.getAll('notifications').map((n: any) => ({
        id: n.id,
        icon: n.type === 'SUCCESS' ? 'success' : n.type === 'INFO' ? 'info' : n.type === 'WARNING' ? 'warning' : 'error',
        title: n.title,
        message: n.message,
        time: this.timeAgo(n.createdAt),
        read: !!n.isRead,
        type: (String(n.type).toLowerCase() === 'alert' ? 'warning' : String(n.type).toLowerCase()) as Notification['type']
      }))
    );
  }

  timeAgo(date: any): string {
    const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diffDays <= 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays}j`;
  }

  filtered = computed(() => {
    const f = this.filter();
    const notifs = this.notifications();
    if (f === 'Tous') return notifs;
    if (f === 'Non lus') return notifs.filter(n => !n.read);
    return notifs.filter(n => n.read);
  });

  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);
  readCount = computed(() => this.notifications().filter(n => n.read).length);

  setFilter(f: string): void {
    this.filter.set(f);
  }

  markAllRead(): void {
    this.mockData.markAllNotificationsAsRead();
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  markRead(n: Notification): void {
    if (!n.read) {
      this.notifications.update(list => list.map(x => x.id === n.id ? { ...x, read: true } : x));
    }
  }
}
