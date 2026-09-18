import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, UserRole } from '../services/auth.service';

export const roleGuard = (...allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    if (authService.hasRole(...allowedRoles)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};

export const superAdminGuard: CanActivateFn = roleGuard('SUPER_ADMIN');
export const proprietaireGuard: CanActivateFn = roleGuard('PROPRIETAIRE', 'SUPER_ADMIN');
export const locataireGuard: CanActivateFn = roleGuard('LOCATAIRE');