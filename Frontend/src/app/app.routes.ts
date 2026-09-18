import { Routes } from '@angular/router';
import { authGuard, superAdminGuard, proprietaireGuard, locataireGuard } from '@core/auth/auth.guard';
import { SUPER_ADMIN_ROUTES } from './features/super-admin/super-admin.routes';
import { PROPRIETAIRE_ROUTES } from './features/proprietaire/proprietaire.routes';
import { LOCATAIRE_ROUTES } from './features/locataire/locataire.routes';
import { AUTH_ROUTES } from './features/auth/auth.routes';

const layout = () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent);

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  ...AUTH_ROUTES,
  {
    path: 'super-admin',
    canActivate: [authGuard, superAdminGuard],
    loadComponent: layout,
    children: SUPER_ADMIN_ROUTES
  },
  {
    path: 'proprietaire',
    canActivate: [authGuard, proprietaireGuard],
    loadComponent: layout,
    children: PROPRIETAIRE_ROUTES
  },
  {
    path: 'locataire',
    canActivate: [authGuard, locataireGuard],
    loadComponent: layout,
    children: LOCATAIRE_ROUTES
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  { path: '**', redirectTo: '' }
];
