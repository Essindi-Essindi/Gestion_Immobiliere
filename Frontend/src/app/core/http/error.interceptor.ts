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
          case 400:
            errorMessage = error.error?.message || 'Requête invalide';
            break;
          case 401:
            if (!req.url.includes('/auth/refresh')) {
              authService.logout();
              router.navigate(['/auth/bailleur/login']);
            }
            return throwError(() => error);
          case 403:
            errorMessage = 'Accès non autorisé';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée';
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
