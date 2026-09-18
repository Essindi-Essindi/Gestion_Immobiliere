import { Routes } from '@angular/router';

export const SUPER_ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'proprietaires', loadComponent: () => import('./pages/proprietaires/proprietaires.component').then(m => m.ProprietairesComponent) },
  { path: 'locataires', loadComponent: () => import('./pages/locataires/locataires.component').then(m => m.LocatairesComponent) },
  { path: 'abonnements', loadComponent: () => import('./pages/abonnements/abonnements.component').then(m => m.AbonnementsComponent) },
  { path: 'parametres', loadComponent: () => import('./pages/parametres/parametres.component').then(m => m.ParametresComponent) },
  { path: 'logs', loadComponent: () => import('./pages/logs/logs.component').then(m => m.LogsComponent) },
  { path: 'support', loadComponent: () => import('./pages/support/support.component').then(m => m.SupportComponent) },
  { path: 'settings', loadComponent: () => import('../settings/settings.component').then(m => m.SettingsComponent) }
];
