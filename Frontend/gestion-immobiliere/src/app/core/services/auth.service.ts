import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { 
  User, 
  UserRole, 
  LoginRequest, 
  RegisterRequest, 
  AuthTokens, 
  ChangePasswordRequest,
  UserPreferences
} from '../models/user.model';

export type { 
  User, 
  UserRole, 
  LoginRequest, 
  RegisterRequest, 
  AuthTokens, 
  ChangePasswordRequest,
  UserPreferences
} from '../models/user.model';

interface MockUser extends User {
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _user = signal<User | null>(null);
  private _tokens = signal<AuthTokens | null>(null);
  private _isAuthenticated = signal(false);

  user = computed(() => this._user());
  tokens = computed(() => this._tokens());
  isAuthenticated = computed(() => this._isAuthenticated());
  isSuperAdmin = computed(() => this._user()?.role === 'SUPER_ADMIN');
  isProprietaire = computed(() => this._user()?.role === 'PROPRIETAIRE');
  isLocataire = computed(() => this._user()?.role === 'LOCATAIRE');

  private readonly USERS_KEY = 'mock_users';
  private readonly TOKEN_KEY = 'mock_access_token';
  private readonly USER_KEY = 'mock_user';
  private readonly REFRESH_KEY = 'mock_refresh_token';

  private readonly DEMO_USERS: MockUser[] = [
    {
      id: '1',
      email: 'superadmin@immo.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      phone: '+237 600 000 001',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      password: 'password123'
    },
    {
      id: '2',
      email: 'bailleur@immo.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'PROPRIETAIRE',
      phone: '+237 600 000 002',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      password: 'password123'
    },
    {
      id: '3',
      email: 'locataire@immo.com',
      firstName: 'Marie',
      lastName: 'Ngo',
      role: 'LOCATAIRE',
      phone: '+237 600 000 003',
      isActive: true,
      createdAt: new Date('2024-02-01'),
      password: 'password123'
    }
  ];

  constructor(private router: Router) {
    this.loadFromStorage();
    this.initDemoUsers();
  }

  private initDemoUsers(): void {
    const existing = localStorage.getItem(this.USERS_KEY);
    if (!existing) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(this.DEMO_USERS));
    }
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this._user.set(user);
        this._isAuthenticated.set(true);
        const tokensStr = localStorage.getItem(this.REFRESH_KEY);
        if (tokensStr) {
          this._tokens.set({ accessToken: token, refreshToken: tokensStr, expiresIn: 3600 });
        }
      } catch {
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  private generateToken(): string {
    return 'mock_jwt_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getUsers(): MockUser[] {
    const raw = localStorage.getItem(this.USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveUsers(users: MockUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private setSession(user: User): void {
    const accessToken = this.generateToken();
    const refreshToken = this.generateToken();
    const tokens: AuthTokens = { accessToken, refreshToken, expiresIn: 3600 };
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
    this._tokens.set(tokens);
    this._isAuthenticated.set(true);
  }

  login(credentials: LoginRequest): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getUsers();
        const found = users.find(
          u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password
        );
        if (!found) {
          reject(new Error('Email ou mot de passe incorrect'));
          return;
        }
        const { password: _, ...user } = found;
        this.setSession(user);
        resolve(user);
      }, 300);
    });
  }

  register(data: RegisterRequest): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getUsers();
        const exists = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
        if (exists) {
          reject(new Error('Un compte avec cet email existe déjà'));
          return;
        }
        const newUser: MockUser = {
          id: (users.length + 1).toString(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          phone: data.phone,
          isActive: true,
          createdAt: new Date(),
          password: data.password
        };
        users.push(newUser);
        this.saveUsers(users);
        const { password: _, ...user } = newUser;
        this.setSession(user);
        resolve(user);
      }, 300);
    });
  }

  logout(): void {
    const role = this._user()?.role;
    this.clearStorage();
    this._user.set(null);
    this._tokens.set(null);
    this._isAuthenticated.set(false);
    if (role === 'SUPER_ADMIN') {
      this.router.navigate(['/auth/super-admin/login']);
    } else if (role === 'LOCATAIRE') {
      this.router.navigate(['/auth/locataire/login']);
    } else {
      this.router.navigate(['/auth/bailleur/login']);
    }
  }

  changePassword(data: ChangePasswordRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUser = this._user();
        if (!currentUser) {
          reject(new Error('Non authentifié'));
          return;
        }
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === currentUser.id);
        if (index === -1) {
          reject(new Error('Utilisateur non trouvé'));
          return;
        }
        if (users[index].password !== data.currentPassword) {
          reject(new Error('Mot de passe actuel incorrect'));
          return;
        }
        users[index].password = data.newPassword;
        this.saveUsers(users);
        resolve();
      }, 300);
    });
  }

  refreshToken(): Promise<void> {
    return new Promise((resolve, reject) => {
      const refreshToken = localStorage.getItem(this.REFRESH_KEY);
      if (!refreshToken) {
        this.logout();
        reject(new Error('No refresh token'));
        return;
      }
      const newAccessToken = this.generateToken();
      localStorage.setItem(this.TOKEN_KEY, newAccessToken);
      const tokens: AuthTokens = { accessToken: newAccessToken, refreshToken, expiresIn: 3600 };
      this._tokens.set(tokens);
      resolve();
    });
  }

  updateProfile(user: Partial<User>): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUser = this._user();
        if (!currentUser) {
          reject(new Error('Non authentifié'));
          return;
        }
        const updatedUser: User = { ...currentUser, ...user };
        localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
        this._user.set(updatedUser);
        resolve(updatedUser);
      }, 300);
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
}