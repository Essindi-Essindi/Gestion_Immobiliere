import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRole, LoginRequest, ChangePasswordRequest, AuthTokens } from '../models/user.model';

export type {
  User,
  UserRole,
  LoginRequest,
  RegisterRequest,
  AuthTokens,
  ChangePasswordRequest,
  UserPreferences
} from '../models/user.model';

// wire format cote backend (ControleurAuthentification) / backend wire format
interface LoginApiResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  id: string;
  role: 'ADMIN' | 'BAILLEUR' | 'LOCATAIRE';
  email: string;
  first_name: string;
  last_name: string;
  must_change_password: boolean;
}

const roleFromApi: Record<LoginApiResponse['role'], UserRole> = {
  ADMIN: 'SUPER_ADMIN',
  BAILLEUR: 'PROPRIETAIRE',
  LOCATAIRE: 'LOCATAIRE'
};

// statut 0 = requete jamais arrivee au serveur (CORS, serveur eteint...), a distinguer d'un vrai 401
// status 0 = request never reached the server (CORS, server down...), distinct from a real 401
export function authErrorMessage(err: HttpErrorResponse, fallback = 'Email ou mot de passe incorrect'): string {
  if (err.status === 0) {
    return 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
  }
  return err.error?.message || fallback;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = `${environment.apiUrl}/authentification`;

  private _user = signal<User | null>(null);
  private _tokens = signal<AuthTokens | null>(null);
  private _isAuthenticated = signal(false);
  private _mustChangePassword = signal(false);

  user = computed(() => this._user());
  tokens = computed(() => this._tokens());
  isAuthenticated = computed(() => this._isAuthenticated());
  mustChangePassword = computed(() => this._mustChangePassword());
  isSuperAdmin = computed(() => this._user()?.role === 'SUPER_ADMIN');
  isProprietaire = computed(() => this._user()?.role === 'PROPRIETAIRE');
  isLocataire = computed(() => this._user()?.role === 'LOCATAIRE');

  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const refresh = localStorage.getItem(this.REFRESH_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    if (token && refresh && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this._user.set(user);
        this._tokens.set({ accessToken: token, refreshToken: refresh, expiresIn: 0 });
        this._isAuthenticated.set(true);
      } catch {
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private setSession(res: LoginApiResponse): User {
    const user: User = {
      id: res.id,
      email: res.email,
      firstName: res.first_name,
      lastName: res.last_name,
      role: roleFromApi[res.role],
      isActive: true,
      createdAt: new Date()
    };
    const tokens: AuthTokens = {
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      expiresIn: res.expires_in
    };
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    localStorage.setItem(this.REFRESH_KEY, res.refresh_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
    this._tokens.set(tokens);
    this._isAuthenticated.set(true);
    this._mustChangePassword.set(res.must_change_password);
    return user;
  }

  login(credentials: LoginRequest): Promise<User> {
    return firstValueFrom(
      this.http.post<LoginApiResponse>(`${this.api}/login`, {
        email: credentials.email,
        password: credentials.password
      })
    ).then(res => this.setSession(res));
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    const role = this._user()?.role;
    this.clearStorage();
    this._user.set(null);
    this._tokens.set(null);
    this._isAuthenticated.set(false);
    this._mustChangePassword.set(false);
    if (refreshToken) {
      // best effort, revoque la session cote serveur / server-side session revocation
      this.http.post(`${this.api}/logout`, { refresh_token: refreshToken }).subscribe({ error: () => {} });
    }
    if (role === 'SUPER_ADMIN') {
      this.router.navigate(['/auth/super-admin/login']);
    } else if (role === 'LOCATAIRE') {
      this.router.navigate(['/auth/locataire/login']);
    } else {
      this.router.navigate(['/auth/bailleur/login']);
    }
  }

  changePassword(data: ChangePasswordRequest): Promise<void> {
    return firstValueFrom(
      this.http.post<LoginApiResponse>(`${this.api}/change-password`, {
        current_password: data.currentPassword,
        new_password: data.newPassword
      })
    ).then(res => {
      this.setSession(res);
    });
  }

  forgotPassword(email: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.api}/forgot-password`, { email }));
  }

  refreshToken(): Promise<void> {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      this.logout();
      return Promise.reject(new Error('Session expiree'));
    }
    return firstValueFrom(
      this.http.post<LoginApiResponse>(`${this.api}/refresh`, { refresh_token: refresh })
    ).then(res => {
      this.setSession(res);
    });
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  hasRole(...roles: UserRole[]): boolean {
    const user = this._user();
    return user ? roles.includes(user.role) : false;
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'PROPRIETAIRE': return 'Bailleur';
      case 'LOCATAIRE': return 'Locataire';
      default: return 'Inconnu';
    }
  }

  getDashboardRoute(role: UserRole): string {
    switch (role) {
      case 'SUPER_ADMIN': return '/super-admin/dashboard';
      case 'PROPRIETAIRE': return '/proprietaire/dashboard';
      case 'LOCATAIRE': return '/locataire/dashboard';
      default: return '/auth/bailleur/login';
    }
  }
}
