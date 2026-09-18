import { Routes } from '@angular/router';

export const PROPRIETAIRE_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'logements', loadComponent: () => import('./pages/logements/logements.component').then(m => m.LogementsComponent) },
  { path: 'locataires', loadComponent: () => import('./pages/locataires/locataires.component').then(m => m.LocatairesComponent) },
  { path: 'locataires/:id/mot-de-passe', loadComponent: () => import('./pages/locataires/locataire-password.component').then(m => m.LocatairePasswordComponent) },
  { path: 'contrats', loadComponent: () => import('./pages/contrats/contrats.component').then(m => m.ContratsComponent) },
  { path: 'loyers', loadComponent: () => import('./pages/loyers/loyers.component').then(m => m.LoyersComponent) },
  { path: 'quittances', loadComponent: () => import('./pages/quittances/quittances.component').then(m => m.QuittancesComponent) },
  { path: 'interventions', loadComponent: () => import('./pages/interventions/interventions.component').then(m => m.InterventionsComponent) },
  { path: 'echeances', loadComponent: () => import('./pages/echeances/echeances.component').then(m => m.EcheancesComponent) },
  { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent) },
  { path: 'documents', loadComponent: () => import('./pages/documents/documents.component').then(m => m.DocumentsComponent) },
  { path: 'settings', loadComponent: () => import('../settings/settings.component').then(m => m.SettingsComponent) }
];
