import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MockAuthService } from '@core/auth/mock-auth.service';

@Component({
  selector: 'app-bailleur-register',
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
          <h1 class="card-title">Créer un compte Bailleur</h1>
          <p class="card-subtitle">Rejoignez la plateforme de gestion immobilière</p>

          @if (errorMessage()) {
            <div class="alert alert-error">{{ errorMessage() }}</div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="field">
                <label class="field-label" for="lastName">Nom</label>
                <input id="lastName" class="field-input" type="text" formControlName="lastName" placeholder="Dupont" />
              </div>
              <div class="field">
                <label class="field-label" for="firstName">Prénom</label>
                <input id="firstName" class="field-input" type="text" formControlName="firstName" placeholder="Jean" />
              </div>
            </div>
            <div class="field">
              <label class="field-label" for="email">Email</label>
              <input id="email" class="field-input" type="email" formControlName="email" placeholder="votre@email.com" />
            </div>
            <div class="field">
              <label class="field-label" for="phone">Téléphone</label>
              <input id="phone" class="field-input" type="tel" formControlName="phone" placeholder="+237 6XX XXX XXX" />
            </div>
            <div class="field">
              <label class="field-label" for="company">Société <span class="optional">(optionnel)</span></label>
              <input id="company" class="field-input" type="text" formControlName="company" placeholder="Nom de votre société" />
            </div>
            <div class="field">
              <label class="field-label" for="password">Mot de passe</label>
              <input id="password" class="field-input" type="password" formControlName="password" placeholder="••••••••" />
            </div>
            <div class="field">
              <label class="field-label" for="confirmPassword">Confirmer mot de passe</label>
              <input id="confirmPassword" class="field-input" type="password" formControlName="confirmPassword" placeholder="••••••••" />
            </div>
            <button type="submit" class="btn-primary" [disabled]="isLoading() || registerForm.invalid">
              @if (isLoading()) {
                <span>Inscription en cours...</span>
              } @else {
                <span>S'inscrire</span>
              }
            </button>
          </form>

          <div class="links">
            <a routerLink="/auth/bailleur/login" class="link">Déjà un compte ? Se connecter</a>
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
      padding: 40px 24px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      width: 100%;
      max-width: 480px;
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
    .row {
      display: flex;
      gap: 16px;
    }
    .row .field {
      flex: 1;
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
    .optional {
      font-weight: 400;
      text-transform: none;
      color: #999999;
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
      text-align: center;
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
  `]
})
export class BailleurRegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: MockAuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      lastName: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      company: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    const formValue = this.registerForm.value;
    if (formValue.password !== formValue.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.authService.register({
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      role: 'PROPRIETAIRE',
      phone: formValue.phone,
      company: formValue.company
    })
      .then(() => {
        this.router.navigate(['/proprietaire/dashboard']);
      })
      .catch((err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      });
  }
}
