import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/auth.interceptor';
import { errorInterceptor } from './http/error.interceptor';
import { loadingInterceptor } from './http/loading.interceptor';

export const coreProviders = [
  provideHttpClient(
    withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])
  )
];
