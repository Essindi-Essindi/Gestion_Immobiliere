import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MockDataService } from '../../../services/mock-data.service';
import { User } from '../../../models/user.model';
import { NavItem } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  template: `
    <header class="header">
      <div class="header-left">
        <button class="sidebar-toggle" (click)="toggleSidebar.emit()" aria-label="Toggle sidebar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>

      <div class="header-right">
        <div class="header-actions">
          <div class="notification-wrapper">
            <button class="icon-btn" (click)="toggleNotifications()" aria-label="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              @if (unreadCount > 0) { <span class="notification-badge"></span> }
            </button>
            @if (notificationOpen) { <div class="dropdown-menu notification-dropdown">
              <div class="dropdown-header">
                <h3>Notifications</h3>
                @if (unreadCount > 0) { <button class="mark-all-read" (click)="markAllAsRead($event)">Tout marquer comme lu</button> }
              </div>
              <div class="dropdown-content">
                @if (notifications.length === 0) { <div class="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666666" stroke-width="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <p>Aucune notification</p>
                </div>
                }
                @for (notif of notifications; track notif.id) {
                <div
                     class="notification-item"
                     [class.unread]="!notif.isRead"
                     (click)="onNotificationClick(notif)">
                  <div [attr.class]="'notification-icon ' + getNotificationIconClass(notif.type)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      @if (notif.type === 'WARNING' || notif.type === 'ERROR') { <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> }
                      @if (notif.type === 'SUCCESS') { <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> }
                      @if (notif.type !== 'WARNING' && notif.type !== 'ERROR' && notif.type !== 'SUCCESS') { <path d="M12 15v2m0-6v.01M12 8a4 4 0 100 8 4 4 0 000-8z"></path> }
                    </svg>
                  </div>
                  <div class="notification-content">
                    <p class="notification-title">{{ notif.title }}</p>
                    <p class="notification-message">{{ notif.message }}</p>
                    <span class="notification-time">{{ formatTime(notif.createdAt) }}</span>
                  </div>
                </div>
                }
              </div>
              <div class="dropdown-footer">
                <span class="view-all-text">{{ notifications.length }} notification(s) au total</span>
              </div>
            </div>
            }
          </div>

          <div class="user-wrapper">
            <button class="user-btn" (click)="toggleUserMenu()" aria-label="User menu">
              @if (currentUser()?.avatar) {
              <div class="user-avatar">
                <img [src]="currentUser()?.avatar" alt="">
              </div>
              } @else {
                <div class="avatar-placeholder">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              }
              <span class="user-name-text">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            @if (userMenuOpen) { <div class="dropdown-menu user-dropdown">
              <div class="user-menu-header">
                <div class="user-info-row">
                  @if (currentUser()?.avatar) {
                  <div class="user-avatar-large">
                    <img [src]="currentUser()?.avatar" alt="">
                  </div>
                  } @else {
                    <div class="avatar-placeholder-large">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  }
                  <div class="user-details">
                    <span class="user-full-name">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</span>
                    <span class="user-role-label">{{ getRoleLabel(currentUser()?.role) }}</span>
                  </div>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <a [routerLink]="profileLink()" class="dropdown-item" (click)="closeMenus()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Mon profil
              </a>
              <a [routerLink]="settingsLink()" class="dropdown-item" (click)="closeMenus()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Paramètres
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item danger-item" (click)="logout()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Déconnexion
              </button>
            </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }

    .header {
      position: sticky;
      top: 0;
      height: 64px;
      background: #000000;
      border-bottom: 1px solid #333333;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      z-index: 50;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .sidebar-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      width: 40px;
      height: 40px;
    }

    .sidebar-toggle:hover {
      background: #1a1a1a;
    }

    .page-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
      white-space: nowrap;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .notification-wrapper {
      position: relative;
    }

    .user-wrapper {
      position: relative;
    }

    .icon-btn {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-btn:hover {
      background: #1a1a1a;
    }

    .notification-badge {
      position: absolute;
      top: 0.375rem;
      right: 0.375rem;
      width: 8px;
      height: 8px;
      min-width: 8px;
      min-height: 8px;
      background: #ffffff;
      pointer-events: none;
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.375rem 0.5rem;
      color: #ffffff;
    }

    .user-btn:hover {
      background: #1a1a1a;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 32px;
      height: 32px;
      background: #333333;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-name-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: #ffffff;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: #111111;
      border: 1px solid #333333;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      z-index: 100;
      overflow: hidden;
    }

    .notification-dropdown {
      width: 380px;
    }

    .user-dropdown {
      width: 280px;
    }

    .dropdown-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #333333;
    }

    .dropdown-header h3 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #ffffff;
    }

    .mark-all-read {
      background: none;
      border: none;
      color: #999999;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
    }

    .mark-all-read:hover {
      color: #ffffff;
    }

    .dropdown-content {
      max-height: 360px;
      overflow-y: auto;
    }

    .dropdown-content::-webkit-scrollbar {
      width: 6px;
    }

    .dropdown-content::-webkit-scrollbar-track {
      background: #111111;
    }

    .dropdown-content::-webkit-scrollbar-thumb {
      background: #333333;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem;
      text-align: center;
      gap: 0.75rem;
    }

    .empty-state p {
      margin: 0;
      color: #666666;
      font-size: 0.875rem;
    }

    .notification-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-bottom: 1px solid #222222;
      cursor: pointer;
      transition: background 0.15s;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-item:hover {
      background: #1a1a1a;
    }

    .notification-item.unread {
      background: #0a0a0a;
    }

    .notification-item.unread:hover {
      background: #1a1a1a;
    }

    .notification-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-icon.warning {
      background: #333333;
      color: #f59e0b;
    }

    .notification-icon.error {
      background: #333333;
      color: #ef4444;
    }

    .notification-icon.success {
      background: #333333;
      color: #22c55e;
    }

    .notification-icon.info {
      background: #333333;
      color: #3b82f6;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      margin: 0 0 0.25rem;
      font-weight: 600;
      font-size: 0.8125rem;
      color: #ffffff;
    }

    .notification-message {
      margin: 0 0 0.25rem;
      font-size: 0.75rem;
      color: #999999;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }

    .notification-time {
      font-size: 0.6875rem;
      color: #666666;
    }

    .dropdown-footer {
      padding: 0.75rem 1rem;
      border-top: 1px solid #333333;
    }

    .view-all-text {
      display: block;
      text-align: center;
      color: #999999;
      font-size: 0.8125rem;
      font-weight: 500;
    }

    .user-menu-header {
      padding: 1rem;
    }

    .user-info-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar-large {
      width: 48px;
      height: 48px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .user-avatar-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder-large {
      width: 48px;
      height: 48px;
      background: #333333;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }

    .user-full-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role-label {
      font-size: 0.75rem;
      color: #999999;
    }

    .dropdown-divider {
      height: 1px;
      background: #333333;
      margin: 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #ffffff;
      text-decoration: none;
      font-size: 0.875rem;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      transition: background 0.15s;
    }

    .dropdown-item:hover {
      background: #1a1a1a;
    }

    .dropdown-item svg {
      color: #999999;
      flex-shrink: 0;
    }

    .dropdown-item:hover svg {
      color: #ffffff;
    }

    .danger-item {
      color: #ef4444;
    }

    .danger-item svg {
      color: #ef4444;
    }

    .danger-item:hover {
      background: #1a1a1a;
    }

    .danger-item:hover svg {
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .header {
        padding: 0 1rem;
      }

      .page-title {
        font-size: 1rem;
      }

      .user-name-text {
        display: none;
      }

      .notification-dropdown {
        width: calc(100vw - 2rem);
        right: -0.5rem;
      }
    }
  `]
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
