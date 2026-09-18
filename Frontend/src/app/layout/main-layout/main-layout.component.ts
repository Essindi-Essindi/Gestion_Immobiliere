import { Component, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AuthService, UserRole } from '@core/auth/auth.service';
import { ToastService, Toast } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, SidebarComponent, HeaderComponent, RouterOutlet],
  template: `
    <div class="layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        [mobileOpen]="mobileSidebarOpen()"
        [navItems]="navItems()"
        (collapsedChange)="sidebarCollapsed.set($event)"
        (mobileOpenChange)="mobileSidebarOpen.set($event)"
      ></app-sidebar>

      <div class="main-area" [style.margin-left.px]="sidebarCollapsed() ? 72 : 260">
        <app-header
          [pageTitle]="pageTitle()"
          (toggleSidebar)="toggleSidebar()"
        ></app-header>

        <main class="content-area" role="main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type">
          <div class="toast-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <use [attr.href]="'#' + getToastIcon(toast.type)"></use>
            </svg>
          </div>
          <div class="toast-body">
            <p class="toast-title">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="toast-message">{{ toast.message }}</p>
            }
          </div>
          @if (toast.action) {
            <button class="toast-action" (click)="toast.action.callback(); toastService.remove(toast.id)">
              {{ toast.action.label }}
            </button>
          }
          <button class="toast-close" (click)="toastService.remove(toast.id)" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      }
    </div>

    @if (loadingService.isLoading()) {
      <div class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ loadingService.loadingMessage() }}</p>
      </div>
    }

    <svg style="display: none;">
      <symbol id="check-circle" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </symbol>
      <symbol id="alert-circle" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </symbol>
      <symbol id="alert-triangle" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </symbol>
      <symbol id="info" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </symbol>
    </svg>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .layout {
      display: flex;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      transition: margin-left 0.3s ease;
    }

    .content-area {
      flex: 1;
      background: #f5f5f5;
      padding: 24px;
      overflow: auto;
    }

    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 420px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border-left: 4px solid;
      animation: toastSlideIn 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
      pointer-events: auto;
    }

    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(80px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    .toast-success {
      border-left-color: #22c55e;
    }

    .toast-error {
      border-left-color: #ef4444;
    }

    .toast-warning {
      border-left-color: #f59e0b;
    }

    .toast-info {
      border-left-color: #3b82f6;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .toast-success .toast-icon {
      background: #dcfce7;
      color: #16a34a;
    }

    .toast-error .toast-icon {
      background: #fee2e2;
      color: #dc2626;
    }

    .toast-warning .toast-icon {
      background: #fef3c7;
      color: #d97706;
    }

    .toast-info .toast-icon {
      background: #dbeafe;
      color: #2563eb;
    }

    .toast-body {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      margin: 0 0 2px;
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.4;
      color: #1e293b;
    }

    .toast-message {
      margin: 0;
      font-size: 0.8125rem;
      line-height: 1.4;
      color: #64748b;
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #94a3b8;
      border-radius: 4px;
      transition: all 0.15s ease;
    }

    .toast-close:hover {
      background: #f1f5f9;
      color: #475569;
    }

    .toast-action {
      flex-shrink: 0;
      background: none;
      border: none;
      color: #3b82f6;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 0;
      transition: opacity 0.15s ease;
    }

    .toast-action:hover {
      opacity: 0.8;
      text-decoration: underline;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 20000;
      gap: 16px;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .loading-text {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
    }

    @media (max-width: 1024px) {
      .main-area {
        margin-left: 0 !important;
      }
    }

    @media (max-width: 640px) {
      .content-area {
        padding: 16px;
      }

      .toast-container {
        left: 16px;
        right: 16px;
        max-width: none;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);

  private routerSub!: Subscription;

  readonly navItems = computed(() => this.getNavItemsForRole(this.authService.user()?.role));
  readonly pageTitle = computed(() => this.getPageTitle(this.router.url));

  constructor(
    private authService: AuthService,
    public toastService: ToastService,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.mobileSidebarOpen.set(false);
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  private getNavItemsForRole(role?: UserRole): NavItem[] {
    const dashboardItem: NavItem = { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' };

    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { label: 'Dashboard', icon: 'dashboard', route: '/super-admin/dashboard' },
          { label: 'Propriétaires', icon: 'users', route: '/super-admin/proprietaires' },
          { label: 'Locataires', icon: 'users', route: '/super-admin/locataires' },
          { label: 'Paramètres', icon: 'settings', route: '/super-admin/parametres' },
          { label: 'Logs', icon: 'activity', route: '/super-admin/logs' },
          { label: 'Support', icon: 'alert-triangle', route: '/super-admin/support' }
        ];

      case 'PROPRIETAIRE':
        return [
          { label: 'Dashboard', icon: 'dashboard', route: '/proprietaire/dashboard' },
          { label: 'Logements', icon: 'home', route: '/proprietaire/logements' },
          { label: 'Locataires', icon: 'users', route: '/proprietaire/locataires' },
          { label: 'Contrats', icon: 'file-text', route: '/proprietaire/contrats' },
          { label: 'Loyers', icon: 'credit-card', route: '/proprietaire/loyers' },
          { label: 'Quittances', icon: 'file', route: '/proprietaire/quittances' },
          { label: 'Interventions', icon: 'alert-triangle', route: '/proprietaire/interventions' },
          { label: 'Paramètres', icon: 'settings', route: '/proprietaire/settings' }
        ];

      case 'LOCATAIRE':
        return [
          { label: 'Dashboard', icon: 'dashboard', route: '/locataire/dashboard' },
          { label: 'Mon Logement', icon: 'home', route: '/locataire/logement' },
          { label: 'Mon Contrat', icon: 'file-text', route: '/locataire/contrat' },
          { label: 'Mes Paiements', icon: 'credit-card', route: '/locataire/paiements' },
          { label: 'Mes Quittances', icon: 'file', route: '/locataire/quittances' },
          { label: 'Signaler Problème', icon: 'alert-circle', route: '/locataire/problemes' },
          { label: 'Notifications', icon: 'bell', route: '/locataire/notifications' },
          { label: 'Mon Profil', icon: 'user', route: '/locataire/profil' }
        ];

      default:
        return [dashboardItem];
    }
  }

  private getPageTitle(url: string): string {
    const titles: Record<string, string> = {
      '/super-admin/dashboard': 'Dashboard Super Admin',
      '/super-admin/proprietaires': 'Gestion des Propriétaires',
      '/super-admin/locataires': 'Gestion des Locataires',
      '/super-admin/abonnements': 'Gestion des Abonnements',
      '/super-admin/parametres': 'Paramètres Système',
      '/super-admin/logs': 'Logs & Activité',
      '/super-admin/support': 'Support & Réclamations',
      '/super-admin/notifications': 'Notifications',
      '/proprietaire/dashboard': 'Dashboard Propriétaire',
      '/proprietaire/logements': 'Mes Logements',
      '/proprietaire/locataires': 'Mes Locataires',
      '/proprietaire/contrats': 'Contrats',
      '/proprietaire/loyers': 'Loyers & Paiements',
      '/proprietaire/quittances': 'Quittances',
      '/proprietaire/interventions': 'Interventions',
      '/proprietaire/echeances': 'Échéances',
      '/proprietaire/notifications': 'Notifications',
      '/proprietaire/documents': 'Documents',
      '/proprietaire/parametres': 'Paramètres',
      '/locataire/dashboard': 'Dashboard Locataire',
      '/locataire/logement': 'Mon Logement',
      '/locataire/contrat': 'Mon Contrat',
      '/locataire/paiements': 'Mes Paiements',
      '/locataire/quittances': 'Mes Quittances',
      '/locataire/problemes': 'Signaler un Problème',
      '/locataire/demandes': 'Mes Demandes',
      '/locataire/notifications': 'Notifications',
      '/locataire/profil': 'Mon Profil',
      '/dashboard': 'Dashboard'
    };

    for (const [path, title] of Object.entries(titles)) {
      if (url.startsWith(path)) {
        return title;
      }
    }
    return 'Gestion Immobilière';
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-triangle';
      default:
        return 'info';
    }
  }
}

interface NavItem {
  label: string;
  icon: string;
  route: string;
}
