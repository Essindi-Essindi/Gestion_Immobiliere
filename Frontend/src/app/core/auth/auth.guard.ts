import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  const role = state.url.split('/')[1];
  const loginRoutes: Record<string, string> = {
    'super-admin': '/auth/super-admin/login',
    'proprietaire': '/auth/bailleur/login',
    'locataire': '/auth/locataire/login'
  };

  return router.navigate([loginRoutes[role] || '/auth/bailleur/login'], { queryParams: { returnUrl: state.url } });
};

export const superAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticated() && authService.hasRole('SUPER_ADMIN')) return true;
  router.navigate(['/auth/super-admin/login']);
  return false;
};

export const proprietaireGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticated() && authService.hasRole('PROPRIETAIRE', 'SUPER_ADMIN')) return true;
  router.navigate(['/auth/bailleur/login']);
  return false;
};

export const locataireGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticated() && authService.hasRole('LOCATAIRE')) return true;
  router.navigate(['/auth/locataire/login']);
  return false;
};
