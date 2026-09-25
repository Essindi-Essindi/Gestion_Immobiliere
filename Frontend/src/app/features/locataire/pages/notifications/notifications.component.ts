import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@core/services/notification.service';
import { NotificationResponse } from '@core/models/notification.model';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [FormsModule, StateBlockComponent],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  allNotifications = signal<NotificationResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filter = 'all';

  filteredNotifications = computed(() =>
    this.filter === 'unread' ? this.allNotifications().filter(n => !n.is_read) : this.allNotifications()
  );
  unreadCount = computed(() => this.allNotifications().filter(n => !n.is_read).length);

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.notificationService.getAll().subscribe({
      next: list => { this.allNotifications.set(list); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger vos notifications.'); this.loading.set(false); }
    });
  }

  markRead(n: NotificationResponse): void {
    if (n.is_read) return;
    this.notificationService.markRead(n.id).subscribe({
      next: () => this.allNotifications.update(list => list.map(x => x.id === n.id ? { ...x, is_read: true } : x))
    });
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => this.allNotifications.update(list => list.map(n => ({ ...n, is_read: true })))
    });
  }

  iconFor(type: string): string {
    const t = (type || '').toUpperCase();
    if (t === 'SUCCESS') return 'check';
    if (t === 'WARNING') return 'clock';
    if (t === 'INFO') return 'info';
    return 'alert';
  }

  timeAgo(date: string): string {
    const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diffDays <= 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays}j`;
  }
}
