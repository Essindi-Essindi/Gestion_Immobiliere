import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '@core/services/mock-data.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './notifications.component.html'
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
