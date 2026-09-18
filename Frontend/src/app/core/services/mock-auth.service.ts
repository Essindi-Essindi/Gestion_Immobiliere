import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user.model';

export interface MockUser extends User {
  password: string;
  company?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  private _user = signal<User | null>(null);
  private _isAuthenticated = signal(false);

  user = computed(() => this._user());
  isAuthenticated = computed(() => this._isAuthenticated());

  private readonly USERS_KEY = 'mock_users';
  private readonly TOKEN_KEY = 'mock_access_token';
  private readonly USER_KEY = 'mock_user';

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
      password: 'password123',
      company: 'Dupont Immobilier'
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
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this._user.set(user);
        this._isAuthenticated.set(true);
      } catch {
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private initDemoUsers(): void {
    const existing = localStorage.getItem(this.USERS_KEY);
    if (!existing) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(this.DEMO_USERS));
    }
  }

  private getUsers(): MockUser[] {
    this.initDemoUsers();
    const raw = localStorage.getItem(this.USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveUsers(users: MockUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private generateToken(): string {
    return 'mock_jwt_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private setSession(user: User): void {
    const token = this.generateToken();
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
    this._isAuthenticated.set(true);
  }

  login(email: string, password: string, role?: UserRole): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getUsers();
        const found = users.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!found) {
          reject(new Error('Email ou mot de passe incorrect'));
          return;
        }
        if (found.isActive === false) {
          reject(new Error('Ce compte a été désactivé. Contactez l\'administrateur.'));
          return;
        }
        if (role && found.role !== role) {
          reject(new Error('Ce compte n\'est pas un ' + this.getRoleLabel(role)));
          return;
        }
        const { password: _, ...user } = found;
        this.setSession(user);
        resolve(user);
      }, 500);
    });
  }

  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    company?: string;
  }): Promise<User> {
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
          password: data.password,
          company: data.company
        };
        users.push(newUser);
        this.saveUsers(users);
        const { password: _, ...user } = newUser;
        this.setSession(user);
        resolve(user);
      }, 500);
    });
  }

  logout(): void {
    this.clearStorage();
    this._user.set(null);
    this._isAuthenticated.set(false);
  }

  forgotPassword(email: string): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getUsers();
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!found) {
          reject(new Error('Aucun compte trouvé avec cet email'));
          return;
        }
        resolve('Un email de réinitialisation a été envoyé à ' + email);
      }, 500);
    });
  }

  changePassword(oldPassword: string, newPassword: string): Promise<void> {
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
        if (users[index].password !== oldPassword) {
          reject(new Error('Mot de passe actuel incorrect'));
          return;
        }
        users[index].password = newPassword;
        this.saveUsers(users);
        resolve();
      }, 300);
    });
  }

  updateEmail(newEmail: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUser = this._user();
        if (!currentUser) {
          reject(new Error('Non authentifié'));
          return;
        }
        const users = this.getUsers();
        const exists = users.find(
          u => u.email.toLowerCase() === newEmail.toLowerCase() && u.id !== currentUser.id
        );
        if (exists) {
          reject(new Error('Cet email est déjà utilisé'));
          return;
        }
        const index = users.findIndex(u => u.id === currentUser.id);
        if (index === -1) {
          reject(new Error('Utilisateur non trouvé'));
          return;
        }
        users[index].email = newEmail;
        this.saveUsers(users);
        const updatedUser: User = { ...currentUser, email: newEmail };
        localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
        this._user.set(updatedUser);
        resolve();
      }, 300);
    });
  }

  updateProfile(data: { firstName: string; lastName: string; phone: string }): Promise<void> {
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
        users[index].firstName = data.firstName;
        users[index].lastName = data.lastName;
        users[index].phone = data.phone;
        this.saveUsers(users);
        const updatedUser: User = { ...currentUser, firstName: data.firstName, lastName: data.lastName, phone: data.phone };
        localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
        this._user.set(updatedUser);
        resolve();
      }, 300);
    });
  }

  getAllUsers(): User[] {
    return this.getUsers().map(({ password: _, ...u }) => u);
  }

  getSubAdmins(): User[] {
    return this.getUsers()
      .filter(u => u.role === 'SUPER_ADMIN' && u.email !== 'superadmin@immo.com')
      .map(({ password: _, ...u }) => u);
  }

  addSubAdmin(data: { firstName: string; lastName: string; email: string; phone: string; password: string }): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getUsers();
        const exists = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
        if (exists) {
          reject(new Error('Un compte avec cet email existe déjà'));
          return;
        }
        const newUser: MockUser = {
          id: 'sa-' + Date.now().toString(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'SUPER_ADMIN',
          phone: data.phone,
          isActive: true,
          createdAt: new Date(),
          password: data.password
        };
        users.push(newUser);
        this.saveUsers(users);
        const { password: _, ...user } = newUser;
        resolve(user);
      }, 300);
    });
  }

  deleteSubAdmin(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.saveUsers(this.getUsers().filter(u => u.id !== id));
        resolve();
      }, 200);
    });
  }

  toggleSubAdminActive(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) {
          reject(new Error('Utilisateur non trouvé'));
          return;
        }
        users[index].isActive = !users[index].isActive;
        this.saveUsers(users);
        resolve();
      }, 200);
    });
  }

  createUserAccount(data: { firstName: string; lastName: string; email: string; phone: string; password: string; role: UserRole }): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getUsers();
        const exists = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
        if (exists) {
          reject(new Error('Un compte avec cet email existe déjà'));
          return;
        }
        const newUser: MockUser = {
          id: 'u-' + Date.now().toString(),
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
        resolve(user);
      }, 300);
    });
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    return this._user();
  }

  isAuthenticatedFn(): boolean {
    return this._isAuthenticated();
  }

  hasRole(role: UserRole): boolean {
    const user = this._user();
    return user ? user.role === role : false;
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
      default: return '/auth/login';
    }
  }
}
