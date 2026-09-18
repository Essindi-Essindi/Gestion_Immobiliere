import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: 'auth/super-admin/login', loadComponent: () => import('./super-admin-login/super-admin-login.component').then(m => m.SuperAdminLoginComponent) },
  { path: 'auth/super-admin/forgot-password', loadComponent: () => import('./super-admin-forgot/super-admin-forgot.component').then(m => m.SuperAdminForgotComponent) },
  { path: 'auth/bailleur/login', loadComponent: () => import('./bailleur-login/bailleur-login.component').then(m => m.BailleurLoginComponent) },
  { path: 'auth/bailleur/register', loadComponent: () => import('./bailleur-register/bailleur-register.component').then(m => m.BailleurRegisterComponent) },
  { path: 'auth/bailleur/forgot-password', loadComponent: () => import('./bailleur-forgot/bailleur-forgot.component').then(m => m.BailleurForgotComponent) },
  { path: 'auth/locataire/login', loadComponent: () => import('./locataire-login/locataire-login.component').then(m => m.LocataireLoginComponent) },
  { path: 'auth/locataire/forgot-password', loadComponent: () => import('./locataire-forgot/locataire-forgot.component').then(m => m.LocataireForgotComponent) }
];
