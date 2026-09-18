import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AuthService, UserRole } from '@core/auth/auth.service';
import { ToastService } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, SidebarComponent, HeaderComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
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
