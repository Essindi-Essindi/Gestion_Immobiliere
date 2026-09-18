import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { MockDataService } from '@core/services/mock-data.service';
import { User } from '@core/models/user.model';
import { NavItem } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() pageTitle: string = 'Tableau de bord';
  @Input() navItems: NavItem[] = [];
  @Output() toggleSidebar = new EventEmitter<void>();

  notificationOpen: boolean = false;
  userMenuOpen: boolean = false;
  unreadCount: number = 0;
  notifications: any[] = [];

  currentUser = this.authService.user;

  constructor(
    public authService: AuthService,
    private mockData: MockDataService
  ) {}

  toggleNotifications(): void {
    this.notificationOpen = !this.notificationOpen;
    this.userMenuOpen = false;
    if (this.notificationOpen) {
      this.loadNotifications();
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    this.notificationOpen = false;
  }

  closeMenus(): void {
    this.notificationOpen = false;
    this.userMenuOpen = false;
  }

  onNotificationClick(notification: any): void {
    if (!notification.isRead) {
      notification.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
    this.notificationOpen = false;
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.mockData.markAllNotificationsAsRead();
    this.notifications.forEach(n => n.isRead = true);
    this.unreadCount = 0;
  }

  logout(): void {
    this.userMenuOpen = false;
    this.authService.logout();
  }

  loadNotifications(): void {
    const all = this.mockData.getAll('notifications');
    this.notifications = all;
    this.unreadCount = all.filter(n => !n.isRead).length;
  }

  getNotificationIconClass(type: string): string {
    switch (type) {
      case 'WARNING': return 'warning';
      case 'ERROR': return 'error';
      case 'SUCCESS': return 'success';
      default: return 'info';
    }
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return d.toLocaleDateString('fr-FR');
  }

  getRoleLabel(role?: string): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'PROPRIETAIRE': return 'Propriétaire';
      case 'LOCATAIRE': return 'Locataire';
      default: return '';
    }
  }

  profileLink(): string {
    switch (this.currentUser()?.role) {
      case 'LOCATAIRE': return '/locataire/profil';
      case 'PROPRIETAIRE': return '/proprietaire/settings';
      default: return '/super-admin/settings';
    }
  }

  settingsLink(): string {
    switch (this.currentUser()?.role) {
      case 'LOCATAIRE': return '/locataire/settings';
      case 'PROPRIETAIRE': return '/proprietaire/settings';
      default: return '/super-admin/settings';
    }
  }
}
