import { Routes } from '@angular/router';
import { authGuard, superAdminGuard, proprietaireGuard, locataireGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'auth/super-admin/login',
    loadComponent: () => import('./pages/auth/super-admin-login/super-admin-login.component').then(m => m.SuperAdminLoginComponent)
  },
  {
    path: 'auth/super-admin/forgot-password',
    loadComponent: () => import('./pages/auth/super-admin-forgot/super-admin-forgot.component').then(m => m.SuperAdminForgotComponent)
  },
  {
    path: 'auth/bailleur/login',
    loadComponent: () => import('./pages/auth/bailleur-login/bailleur-login.component').then(m => m.BailleurLoginComponent)
  },
  {
    path: 'auth/bailleur/register',
    loadComponent: () => import('./pages/auth/bailleur-register/bailleur-register.component').then(m => m.BailleurRegisterComponent)
  },
  {
    path: 'auth/bailleur/forgot-password',
    loadComponent: () => import('./pages/auth/bailleur-forgot/bailleur-forgot.component').then(m => m.BailleurForgotComponent)
  },
  {
    path: 'auth/locataire/login',
    loadComponent: () => import('./pages/auth/locataire-login/locataire-login.component').then(m => m.LocataireLoginComponent)
  },
  {
    path: 'auth/locataire/forgot-password',
    loadComponent: () => import('./pages/auth/locataire-forgot/locataire-forgot.component').then(m => m.LocataireForgotComponent)
  },
  {
    path: 'super-admin',
    canActivate: [authGuard, superAdminGuard],
    loadComponent: () => import('./core/components/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/super-admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'proprietaires', loadComponent: () => import('./features/super-admin/proprietaires/proprietaires.component').then(m => m.ProprietairesComponent) },
      { path: 'locataires', loadComponent: () => import('./features/super-admin/locataires/locataires.component').then(m => m.LocatairesComponent) },
      { path: 'abonnements', loadComponent: () => import('./features/super-admin/abonnements/abonnements.component').then(m => m.AbonnementsComponent) },
      { path: 'parametres', loadComponent: () => import('./features/super-admin/parametres/parametres.component').then(m => m.ParametresComponent) },
      { path: 'logs', loadComponent: () => import('./features/super-admin/logs/logs.component').then(m => m.LogsComponent) },
      { path: 'support', loadComponent: () => import('./features/super-admin/support/support.component').then(m => m.SupportComponent) },
      { path: 'notifications', loadComponent: () => import('./features/super-admin/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) }
    ]
  },
  {
    path: 'proprietaire',
    canActivate: [authGuard, proprietaireGuard],
    loadComponent: () => import('./core/components/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/proprietaire/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'logements', loadComponent: () => import('./features/proprietaire/logements/logements.component').then(m => m.LogementsComponent) },
      { path: 'locataires', loadComponent: () => import('./features/proprietaire/locataires/locataires.component').then(m => m.LocatairesComponent) },
      { path: 'locataires/:id/mot-de-passe', loadComponent: () => import('./features/proprietaire/locataires/locataire-password.component').then(m => m.LocatairePasswordComponent) },
      { path: 'contrats', loadComponent: () => import('./features/proprietaire/contrats/contrats.component').then(m => m.ContratsComponent) },
      { path: 'loyers', loadComponent: () => import('./features/proprietaire/loyers/loyers.component').then(m => m.LoyersComponent) },
      { path: 'quittances', loadComponent: () => import('./features/proprietaire/quittances/quittances.component').then(m => m.QuittancesComponent) },
      { path: 'interventions', loadComponent: () => import('./features/proprietaire/interventions/interventions.component').then(m => m.InterventionsComponent) },
      { path: 'echeances', loadComponent: () => import('./features/proprietaire/echeances/echeances.component').then(m => m.EcheancesComponent) },
      { path: 'notifications', loadComponent: () => import('./features/proprietaire/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'documents', loadComponent: () => import('./features/proprietaire/documents/documents.component').then(m => m.DocumentsComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) }
    ]
  },
  {
    path: 'locataire',
    canActivate: [authGuard, locataireGuard],
    loadComponent: () => import('./core/components/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/locataire/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'logement', loadComponent: () => import('./features/locataire/logement/logement.component').then(m => m.LogementComponent) },
      { path: 'contrat', loadComponent: () => import('./features/locataire/contrat/contrat.component').then(m => m.ContratComponent) },
      { path: 'paiements', loadComponent: () => import('./features/locataire/paiements/paiements.component').then(m => m.PaiementsComponent) },
      { path: 'quittances', loadComponent: () => import('./features/locataire/quittances/quittances.component').then(m => m.QuittancesComponent) },
      { path: 'problemes', loadComponent: () => import('./features/locataire/problemes/problemes.component').then(m => m.ProblemesComponent) },
      { path: 'demandes', loadComponent: () => import('./features/locataire/demandes/demandes.component').then(m => m.DemandesComponent) },
      { path: 'notifications', loadComponent: () => import('./features/locataire/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'profil', loadComponent: () => import('./features/locataire/profil/profil.component').then(m => m.ProfilComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) }
    ]
  },
  { path: 'unauthorized', loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) },
  { path: '**', redirectTo: '' }
];
