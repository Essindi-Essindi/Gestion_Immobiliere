import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400: {
            // first field detail if any (ex: weak password) / premier detail de champ si present
            const detail = error.error?.details?.[0]?.message;
            errorMessage = detail || error.error?.message || 'Requête invalide';
            break;
          }
          case 409:
            errorMessage = error.error?.message || 'Action impossible pour le moment';
            break;
          case 401:
            if (!req.url.includes('/authentification/refresh')) {
              authService.logout();
            }
            return throwError(() => error);
          case 403:
            if (error.headers.get('X-Auth-Action') === 'password-change-required') {
              const settingsRoutes: Record<string, string> = {
                SUPER_ADMIN: '/super-admin/settings',
                PROPRIETAIRE: '/proprietaire/settings',
                LOCATAIRE: '/locataire/settings'
              };
              const role = authService.user()?.role;
              router.navigate([role ? settingsRoutes[role] : '/auth/bailleur/login'], { queryParams: { forced: true } });
              return throwError(() => error);
            }
            errorMessage = 'Accès non autorisé';
            break;
          case 404:
            errorMessage = error.error?.message || 'Ressource non trouvée';
            break;
          case 422:
            errorMessage = error.error?.message || 'Données invalides';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          case 0:
            errorMessage = 'Impossible de se connecter au serveur';
            break;
          default:
            errorMessage = error.error?.message || `Erreur ${error.status}`;
        }
      }

      if (error.status !== 401 || req.url.includes('/auth/refresh')) {
        toastService.error('Erreur', errorMessage);
      }

      return throwError(() => error);
    })
  );
};
