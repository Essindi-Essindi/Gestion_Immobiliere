import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="padding: 24px; background: #f5f5f5; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 style="margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #000;">Notifications</h1>
          <p style="margin: 0; color: #666; font-size: 14px;">Centre de notifications et alertes</p>
        </div>
        <button (click)="markAllRead()"
          style="background: #fff; color: #000; border: 1px solid #e0e0e0; padding: 8px 16px; font-size: 13px; cursor: pointer; font-weight: 600;">
          Tout marquer comme lu
        </button>
      </div>

      <!-- Filter Tabs -->
      <div style="display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
        <button (click)="filter.set('all')"
          [style.background]="filter() === 'all' ? '#000' : '#fff'"
          [style.color]="filter() === 'all' ? '#fff' : '#333'"
          [style.border]="filter() === 'all' ? '1px solid #000' : '1px solid #e0e0e0'"
          style="padding: 8px 20px; font-size: 13px; cursor: pointer; font-weight: 600; border-bottom: none; margin-bottom: -1px;">
          Tous
        </button>
        <button (click)="filter.set('unread')"
          [style.background]="filter() === 'unread' ? '#000' : '#fff'"
          [style.color]="filter() === 'unread' ? '#fff' : '#333'"
          [style.border]="filter() === 'unread' ? '1px solid #000' : '1px solid #e0e0e0'"
          style="padding: 8px 20px; font-size: 13px; cursor: pointer; font-weight: 600; border-bottom: none; margin-bottom: -1px;">
          Non lus ({{ unreadCount() }})
        </button>
      </div>

      <!-- Notifications List -->
      <div style="display: flex; flex-direction: column; gap: 8px;">
        @for (notif of displayedNotifications(); track notif.id) {
          <div style="background: #fff; border: 1px solid #e0e0e0; padding: 16px; display: flex; align-items: flex-start; gap: 12px;"
            [style.border-left]="notif.isRead ? '3px solid #e0e0e0' : '3px solid #000'">
            <!-- Icon -->
            <div [style.background]="getNotifIconBg(notif.type)"
              style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              @if (notif.type === 'WARNING') { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" [attr.stroke]="getNotifIconColor(notif.type)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
              @if (notif.type === 'ALERT') { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" [attr.stroke]="getNotifIconColor(notif.type)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> }
              @if (notif.type === 'ERROR') { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" [attr.stroke]="getNotifIconColor(notif.type)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> }
              @if (notif.type === 'SUCCESS') { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" [attr.stroke]="getNotifIconColor(notif.type)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }
              @if (notif.type === 'INFO') { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" [attr.stroke]="getNotifIconColor(notif.type)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> }
            </div>

            <!-- Content -->
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                <span style="font-size: 14px; font-weight: 600; color: #000;">{{ notif.title }}</span>
                @if (!notif.isRead) {
                  <div style="width: 6px; height: 6px; background: #000; border-radius: 50%;"></div>
                }
              </div>
              <p style="margin: 0; font-size: 13px; color: #666;">{{ notif.message }}</p>
            </div>

            <!-- Time -->
            <span style="font-size: 12px; color: #999; white-space: flex-shrink: 0;">{{ getTimeAgo(notif.createdAt) }}</span>
          </div>
        }
      </div>

      @if (displayedNotifications().length === 0) {
        <div style="background: #fff; border: 1px solid #e0e0e0; padding: 48px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">Aucune notification</p>
        </div>
      }
    </div>
  `
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
