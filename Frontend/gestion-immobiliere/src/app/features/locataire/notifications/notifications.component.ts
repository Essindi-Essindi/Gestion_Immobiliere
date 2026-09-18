import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="padding:24px;background:#f5f5f5;min-height:100vh;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <div>
          <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:#000;">Notifications</h1>
          <p style="margin:0;color:#757575;font-size:14px;">{{ unreadCount }} non lues</p>
        </div>
        <div style="display:flex;gap:8px;">
          <select [(ngModel)]="filter" (change)="applyFilter()" style="padding:8px 12px;border:1px solid #e0e0e0;font-size:13px;background:#fff;color:#000;">
            <option value="all">Tous</option>
            <option value="unread">Non lus</option>
          </select>
          <button (click)="markAllRead()" style="padding:8px 16px;background:#fff;color:#000;border:1px solid #e0e0e0;font-size:13px;font-weight:500;cursor:pointer;">
            Tout marquer comme lu
          </button>
        </div>
      </div>

      <div style="background:#fff;border:1px solid #e0e0e0;">
        @for (n of filteredNotifications; track n.id) {
          <div style="display:flex;align-items:flex-start;gap:14px;padding:16px 20px;border-bottom:1px solid #f0f0f0;" [style.background]="n.isRead ? 'transparent' : '#fafafa'">
            <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;flex-shrink:0;" [style.background]="n.type === 'SUCCESS' ? '#000' : '#e0e0e0'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" [attr.stroke]="n.type === 'SUCCESS' ? '#fff' : '#424242'" stroke-width="2">
                @if (n.icon === 'clock') { <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/> }
                @else if (n.icon === 'check') { <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/> }
                @else if (n.icon === 'info') { <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/> }
                @else { <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/> }
              </svg>
            </div>
            <div style="flex:1;min-width:0;">
              <p style="margin:0 0 4px;font-size:14px;color:#000;font-weight:600;">{{ n.title }}</p>
              <p style="margin:0 0 6px;font-size:13px;color:#616161;">{{ n.message }}</p>
              <span style="font-size:12px;color:#9e9e9e;">{{ n.timeAgo }}</span>
            </div>
            @if (!n.isRead) {
              <div style="width:10px;height:10px;background:#000;flex-shrink:0;margin-top:6px;"></div>
            }
          </div>
        } @empty {
          <div style="padding:60px 20px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" stroke-width="2" style="margin-bottom:16px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <p style="margin:0;font-size:14px;color:#9e9e9e;">Aucune notification</p>
          </div>
        }
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  allNotifications: any[] = [];
  filteredNotifications: any[] = [];
  filter = 'all';
  unreadCount = 0;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.allNotifications = this.mockDataService.getAll('notifications').map((n: any) => ({
      ...n,
      icon: n.type === 'SUCCESS' ? 'check' : n.type === 'INFO' ? 'info' : n.type === 'WARNING' ? 'clock' : 'alert',
      timeAgo: this.timeAgo(n.createdAt)
    }));
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredNotifications = this.filter === 'unread'
      ? this.allNotifications.filter(n => !n.isRead)
      : [...this.allNotifications];
    this.unreadCount = this.allNotifications.filter(n => !n.isRead).length;
  }

  markAllRead(): void {
    this.mockDataService.markAllNotificationsAsRead();
    this.allNotifications.forEach(n => n.isRead = true);
    this.applyFilter();
  }

  timeAgo(date: any): string {
    const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diffDays <= 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays}j`;
  }
}
