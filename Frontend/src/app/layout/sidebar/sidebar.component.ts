import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService, UserRole } from '@core/auth/auth.service';

export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  roles?: UserRole[];
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed" [class.mobile-open]="mobileOpen">
      <div class="sidebar-header">
        @if (!collapsed) {
          <div class="logo">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Gestion Immo</span>
          </div>
        } @else {
          <div class="logo-collapsed">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
        }
        <button class="toggle-btn" (click)="toggleSidebar()" aria-label="Toggle sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (!collapsed) {
              <polyline points="15 18 9 12 15 6"></polyline>
            } @else {
              <polyline points="9 18 15 12 9 6"></polyline>
            }
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <ul>
          @for (item of navItems; track item.label) {
            <li class="nav-item">
              <a [routerLink]="item.route" routerLinkActive="active" class="nav-link" (click)="onNavClick()">
                <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <use [attr.href]="'#' + item.icon"></use>
                </svg>
                @if (!collapsed) {
                  <span class="nav-label">{{ item.label }}</span>
                }
                @if (item.badge && item.badge > 0) {
                  <span class="badge">{{ item.badge }}</span>
                }
              </a>
            </li>
          }
        </ul>
      </nav>

      @if (!collapsed) {
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="avatar placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="user-details">
              <span class="user-name">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</span>
              <span class="user-role">{{ getRoleLabel(currentUser()?.role) }}</span>
            </div>
          </div>
        </div>
      }
    </aside>

    @if (mobileOpen) {
      <div class="sidebar-overlay" (click)="closeMobile()"></div>
    }

    <svg style="display: none;">
      <symbol id="dashboard" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
      </symbol>
      <symbol id="users" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </symbol>
      <symbol id="home" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </symbol>
      <symbol id="file-text" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </symbol>
      <symbol id="credit-card" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16"></rect>
        <line x1="1" y1="10" x2="23" y2="10"></line>
      </symbol>
      <symbol id="settings" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </symbol>
      <symbol id="activity" viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </symbol>
      <symbol id="alert-triangle" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </symbol>
      <symbol id="shield" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </symbol>
      <symbol id="bell" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </symbol>
      <symbol id="file" viewBox="0 0 24 24">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </symbol>
      <symbol id="calendar" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </symbol>
      <symbol id="alert-circle" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </symbol>
      <symbol id="user" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </symbol>
      <symbol id="archive" viewBox="0 0 24 24">
        <polyline points="21 8 21 21 3 21 3 8"></polyline>
        <rect x="1" y="3" width="22" height="5"></rect>
        <line x1="10" y1="12" x2="14" y2="12"></line>
      </symbol>
    </svg>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 260px;
      background: #000000;
      display: flex;
      flex-direction: column;
      z-index: 100;
      transition: width 0.3s ease, transform 0.3s ease;
      overflow: hidden;
    }
    .sidebar.collapsed { width: 72px; }
    @media (max-width: 1024px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.mobile-open { transform: translateX(0); width: 260px; }
    }
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #333333;
      min-height: 64px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #ffffff;
      font-weight: 700;
      font-size: 1.05rem;
      white-space: nowrap;
    }
    .logo-collapsed { display: flex; justify-content: center; color: #ffffff; }
    .toggle-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      color: #999999;
    }
    .toggle-btn:hover { background: #1a1a1a; color: #ffffff; }
    .sidebar-nav { flex: 1; overflow-y: auto; padding: 1rem 0.5rem; }
    .sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
    .nav-item { margin-bottom: 0.25rem; }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #999999;
      text-decoration: none;
      white-space: nowrap;
      border-left: 2px solid transparent;
    }
    .nav-link:hover { background: #1a1a1a; color: #ffffff; }
    .nav-link.active { color: #ffffff; border-left-color: #ffffff; background: #111111; }
    .nav-icon { flex-shrink: 0; width: 18px; height: 18px; }
    .nav-label { font-size: 0.875rem; font-weight: 500; }
    .badge {
      margin-left: auto;
      padding: 0.125rem 0.5rem;
      background: #ffffff;
      color: #000000;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .sidebar-footer { padding: 1rem; border-top: 1px solid #333333; }
    .user-info { display: flex; align-items: center; gap: 0.75rem; }
    .avatar {
      width: 38px;
      height: 38px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .avatar.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #222222;
      color: #ffffff;
    }
    .user-details { display: flex; flex-direction: column; min-width: 0; }
    .user-name {
      font-weight: 600;
      font-size: 0.85rem;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role { font-size: 0.72rem; color: #999999; }
    .sidebar-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Input() navItems: NavItem[] = [];
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() mobileOpenChange = new EventEmitter<boolean>();

  currentUser = this.authService.user;

  constructor(public authService: AuthService) {}

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  closeMobile(): void {
    this.mobileOpen = false;
    this.mobileOpenChange.emit(false);
  }

  onNavClick(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      this.closeMobile();
    }
  }

  getRoleLabel(role?: UserRole): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'PROPRIETAIRE': return 'Propriétaire';
      case 'LOCATAIRE': return 'Locataire';
      default: return '';
    }
  }
}
