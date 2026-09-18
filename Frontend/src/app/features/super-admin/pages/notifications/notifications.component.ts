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
template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Historique des notifications de la plateforme</p>
        </div>
        <div class="header-actions">
          <button class="btn-outline" (click)="markAllRead()">Tout marquer comme lu</button>
        </div>
      </div>

      <div class="card">
        <div class="card-toolbar">
          <div class="filters">
            <button [class.active]="filter() === 'Tous'" (click)="setFilter('Tous')">
              Tous <span class="count">{{ notifications().length }}</span>
            </button>
            <button [class.active]="filter() === 'Non lus'" (click)="setFilter('Non lus')">
              Non lus <span class="count">{{ unreadCount() }}</span>
            </button>
            <button [class.active]="filter() === 'Lus'" (click)="setFilter('Lus')">
              Lus <span class="count">{{ readCount() }}</span>
            </button>
          </div>
        </div>

        <div class="notif-list">
          @for (n of filtered(); track n.id) {
            <div class="notif-item" [class.unread]="!n.read" (click)="markRead(n)">
              <div class="notif-icon" [class]="'icon-' + n.type">
                @if (n.type === 'info') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                } @else if (n.type === 'warning') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                } @else if (n.type === 'success') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                }
              </div>
              <div class="notif-content">
                <span class="notif-title">{{ n.title }}</span>
                <span class="notif-message">{{ n.message }}</span>
              </div>
              <div class="notif-meta">
                <span class="notif-time">{{ n.time }}</span>
                @if (!n.read) {
                  <span class="unread-dot"></span>
                }
              </div>
            </div>
          }
          @if (filtered().length === 0) {
            <div class="empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              <p>Aucune notification</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; background: #f5f5f5; min-height: 100vh; }
    .page-header { margin-bottom: 24px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
    .page-header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #000; font-family: inherit; }
    .page-header p { margin: 0; font-size: 14px; color: #666; font-family: inherit; }
    .btn-outline { padding: 10px 20px; font-size: 13px; font-weight: 500; border: 1px solid #e0e0e0; background: #fff; color: #000; cursor: pointer; font-family: inherit; white-space: nowrap; }
    .btn-outline:hover { background: #f5f5f5; }
    .card { background: #fff; border: 1px solid #e0e0e0; }
    .card-toolbar { padding: 16px 20px; border-bottom: 1px solid #e0e0e0; }
    .filters { display: flex; gap: 0; }
    .filters button { padding: 8px 16px; font-size: 13px; border: 1px solid #e0e0e0; background: #fff; color: #666; cursor: pointer; font-family: inherit; margin-left: -1px; display: flex; align-items: center; gap: 6px; }
    .filters button:first-child { margin-left: 0; }
    .filters button.active { background: #000; color: #fff; border-color: #000; z-index: 1; }
    .filters button .count { font-size: 11px; font-weight: 700; opacity: 0.7; }
    .filters button.active .count { opacity: 1; }
    .notif-list { display: flex; flex-direction: column; }
    .notif-item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background 0.15s; }
    .notif-item:last-child { border-bottom: none; }
    .notif-item:hover { background: #fafafa; }
    .notif-item.unread { background: #fafafa; }
    .notif-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .icon-info { background: #f0f0f0; color: #000; }
    .icon-warning { background: #e0e0e0; color: #333; }
    .icon-success { background: #000; color: #fff; }
    .icon-error { background: #666; color: #fff; }
    .notif-content { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .notif-title { font-size: 14px; font-weight: 600; color: #000; }
    .notif-message { font-size: 13px; color: #666; line-height: 1.4; }
    .notif-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
    .notif-time { font-size: 12px; color: #999; white-space: nowrap; }
    .unread-dot { width: 8px; height: 8px; background: #000; border-radius: 50%; }
    .empty { padding: 60px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty p { margin: 0; font-size: 14px; color: #999; }
    @media (max-width: 640px) { .page-header { flex-direction: column; } }
  `]
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
