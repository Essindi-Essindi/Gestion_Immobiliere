import { Routes } from '@angular/router';

export const LOCATAIRE_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'logement', loadComponent: () => import('./pages/logement/logement.component').then(m => m.LogementComponent) },
  { path: 'contrat', loadComponent: () => import('./pages/contrat/contrat.component').then(m => m.ContratComponent) },
  { path: 'paiements', loadComponent: () => import('./pages/paiements/paiements.component').then(m => m.PaiementsComponent) },
  { path: 'quittances', loadComponent: () => import('./pages/quittances/quittances.component').then(m => m.QuittancesComponent) },
  { path: 'problemes', loadComponent: () => import('./pages/problemes/problemes.component').then(m => m.ProblemesComponent) },
  { path: 'demandes', loadComponent: () => import('./pages/demandes/demandes.component').then(m => m.DemandesComponent) },
  { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent) },
  { path: 'profil', loadComponent: () => import('./pages/profil/profil.component').then(m => m.ProfilComponent) },
  { path: 'settings', loadComponent: () => import('../settings/settings.component').then(m => m.SettingsComponent) }
];
