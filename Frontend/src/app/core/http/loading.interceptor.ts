import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

const excludedUrls = ['/authentification/refresh', '/notifications/unread-count'];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const shouldTrack = !excludedUrls.some(url => req.url.includes(url));

  if (shouldTrack) {
    const loaderId = loadingService.show();
    return next(req).pipe(finalize(() => loadingService.hide(loaderId)));
  }
  return next(req);
};
