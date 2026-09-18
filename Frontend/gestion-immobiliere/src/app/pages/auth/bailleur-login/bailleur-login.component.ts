import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MockAuthService } from '../../../core/services/mock-auth.service';

@Component({
  selector: 'app-bailleur-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="header">
        <div class="header-inner">
          <span class="logo-text">Gestion Immobilière</span>
        </div>
      </div>
      <div class="body">
        <div class="card">
          <h1 class="card-title">Bailleur - Connexion</h1>
          <p class="card-subtitle">Connectez-vous à votre espace propriétaire</p>

          @if (errorMessage()) {
            <div class="alert alert-error">{{ errorMessage() }}</div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="field">
              <label class="field-label" for="email">Email</label>
              <input
                id="email"
                class="field-input"
                type="email"
                formControlName="email"
                placeholder="votre@email.com"
              />
            </div>
            <div class="field">
              <label class="field-label" for="password">Mot de passe</label>
              <input
                id="password"
                class="field-input"
                type="password"
                formControlName="password"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              class="btn-primary"
              [disabled]="isLoading() || loginForm.invalid"
            >
              @if (isLoading()) {
                <span>Connexion en cours...</span>
              } @else {
                <span>Se connecter</span>
              }
            </button>
          </form>

          <div class="links">
            <a routerLink="/auth/bailleur/forgot-password" class="link">Mot de passe oublié ?</a>
            <a routerLink="/auth/bailleur/register" class="link">Créer un compte</a>
          </div>

          <div class="divider"></div>

          <div class="alt-links">
            <p class="alt-title">Autres connexions</p>
            <a routerLink="/auth/super-admin/login" class="link-alt">Connexion Super Admin</a>
            <a routerLink="/auth/locataire/login" class="link-alt">Connexion Locataire</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      background: #f5f5f5;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .header {
      background: #000000;
      height: 64px;
      display: flex;
      align-items: center;
    }
    .header-inner {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 0 24px;
    }
    .logo-text {
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .body {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 60px 24px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      width: 100%;
      max-width: 420px;
      padding: 40px;
    }
    .card-title {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 700;
      color: #000000;
    }
    .card-subtitle {
      margin: 0 0 32px;
      font-size: 14px;
      color: #666666;
    }
    .alert {
      padding: 12px 16px;
      margin-bottom: 24px;
      font-size: 14px;
      font-weight: 500;
    }
    .alert-error {
      background: #000000;
      color: #ffffff;
      border: 1px solid #333333;
    }
    .field {
      margin-bottom: 20px;
    }
    .field-label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .field-input {
      width: 100%;
      padding: 12px 16px;
      font-size: 15px;
      color: #000000;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 0;
      outline: none;
      box-sizing: border-box;
      font-family: inherit;
    }
    .field-input:focus {
      border-color: #000000;
    }
    .field-input::placeholder {
      color: #aaaaaa;
    }
    .btn-primary {
      width: 100%;
      padding: 14px;
      margin-top: 8px;
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
      background: #000000;
      border: none;
      border-radius: 0;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-primary:hover:not(:disabled) {
      background: #222222;
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .links {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }
    .link {
      font-size: 14px;
      font-weight: 500;
      color: #000000;
      text-decoration: none;
    }
    .link:hover {
      text-decoration: underline;
    }
    .divider {
      margin: 28px 0;
      border-top: 1px solid #e0e0e0;
    }
    .alt-links {
      text-align: center;
    }
    .alt-title {
      margin: 0 0 16px;
      font-size: 13px;
      font-weight: 600;
      color: #666666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .link-alt {
      display: block;
      padding: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #000000;
      text-decoration: none;
      border: 1px solid #e0e0e0;
      margin-bottom: 8px;
      transition: background 0.15s;
    }
    .link-alt:hover {
      background: #f5f5f5;
    }
  `]
})
export class BailleurLoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: MockAuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password, 'PROPRIETAIRE')
      .then(() => {
        this.router.navigate(['/proprietaire/dashboard']);
      })
      .catch((err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      });
  }
}
