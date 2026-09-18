import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MockAuthService } from '@core/auth/mock-auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="header">
        <div class="header-inner">
          <span class="logo-text">Gestion Immobilière</span>
          <span class="header-subtitle">Paramètres</span>
        </div>
      </div>
      <div class="body">
        <div class="container">
          <h1 class="page-title">Paramètres du compte</h1>

          @if (toastMessage()) {
            <div class="toast" [class.toast-success]="toastType() === 'success'" [class.toast-error]="toastType() === 'error'">
              {{ toastMessage() }}
            </div>
          }

          <div class="section">
            <h2 class="section-title">Mon profil</h2>
            <p class="section-desc">Vos informations personnelles visibles dans l'application.</p>
            <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
              <div class="field">
                <label class="field-label" for="firstName">Prénom</label>
                <input id="firstName" class="field-input" type="text" formControlName="firstName" placeholder="Votre prénom" />
              </div>
              <div class="field">
                <label class="field-label" for="lastName">Nom</label>
                <input id="lastName" class="field-input" type="text" formControlName="lastName" placeholder="Votre nom" />
              </div>
              <div class="field">
                <label class="field-label" for="phone">Téléphone</label>
                <input id="phone" class="field-input" type="tel" formControlName="phone" placeholder="+237 ..." />
              </div>
              <button type="submit" class="btn-primary" [disabled]="profileLoading() || profileForm.invalid">
                @if (profileLoading()) {
                  <span>Enregistrement...</span>
                } @else {
                  <span>Enregistrer le profil</span>
                }
              </button>
            </form>
          </div>

          <div class="section-divider"></div>

          <div class="section">
            <h2 class="section-title">Changer l'email</h2>
            <p class="section-desc">Modifiez l'adresse email associée à votre compte.</p>
            <form [formGroup]="emailForm" (ngSubmit)="onUpdateEmail()">
              <div class="field">
                <label class="field-label">Email actuel</label>
                <input class="field-input field-readonly" type="email" [value]="currentUser()?.email" readonly />
              </div>
              <div class="field">
                <label class="field-label" for="newEmail">Nouvel email</label>
                <input id="newEmail" class="field-input" type="email" formControlName="newEmail" placeholder="nouveau@email.com" />
              </div>
              <button type="submit" class="btn-primary" [disabled]="emailLoading() || emailForm.invalid">
                @if (emailLoading()) {
                  <span>Mise à jour...</span>
                } @else {
                  <span>Mettre à jour</span>
                }
              </button>
            </form>
          </div>

          <div class="section-divider"></div>

          <div class="section">
            <h2 class="section-title">Changer le mot de passe</h2>
            <p class="section-desc">Assurez-vous d'utiliser un mot de passe fort et unique.</p>
            <form [formGroup]="passwordForm" (ngSubmit)="onUpdatePassword()">
              <div class="field">
                <label class="field-label" for="currentPassword">Mot de passe actuel</label>
                <input id="currentPassword" class="field-input" type="password" formControlName="currentPassword" placeholder="••••••••" />
              </div>
              <div class="field">
                <label class="field-label" for="newPassword">Nouveau mot de passe</label>
                <input id="newPassword" class="field-input" type="password" formControlName="newPassword" placeholder="••••••••" />
              </div>
              <div class="field">
                <label class="field-label" for="confirmPassword">Confirmer le nouveau mot de passe</label>
                <input id="confirmPassword" class="field-input" type="password" formControlName="confirmPassword" placeholder="••••••••" />
              </div>
              <button type="submit" class="btn-primary" [disabled]="passwordLoading() || passwordForm.invalid">
                @if (passwordLoading()) {
                  <span>Changement en cours...</span>
                } @else {
                  <span>Changer le mot de passe</span>
                }
              </button>
            </form>
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
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-text {
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header-subtitle {
      color: #999999;
      font-size: 14px;
      font-weight: 500;
    }
    .body {
      padding: 40px 24px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
    }
    .page-title {
      margin: 0 0 32px;
      font-size: 28px;
      font-weight: 700;
      color: #000000;
    }
    .toast {
      padding: 14px 20px;
      margin-bottom: 24px;
      font-size: 14px;
      font-weight: 500;
    }
    .toast-success {
      background: #000000;
      color: #ffffff;
      border: 1px solid #333333;
    }
    .toast-error {
      background: #ffffff;
      color: #000000;
      border: 2px solid #000000;
    }
    .section {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 32px;
    }
    .section-title {
      margin: 0 0 6px;
      font-size: 18px;
      font-weight: 700;
      color: #000000;
    }
    .section-desc {
      margin: 0 0 24px;
      font-size: 14px;
      color: #666666;
    }
    .section-divider {
      height: 24px;
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
    .field-readonly {
      background: #f5f5f5;
      color: #666666;
      cursor: not-allowed;
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
  `]
})
export class SettingsComponent {
  emailForm: FormGroup;
  passwordForm: FormGroup;
  profileForm: FormGroup;
  emailLoading = signal(false);
  passwordLoading = signal(false);
  profileLoading = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  currentUser = this.authService.user;

  constructor(
    private fb: FormBuilder,
    private authService: MockAuthService
  ) {
    const u = this.authService.getUser();
    this.profileForm = this.fb.group({
      firstName: [u?.firstName || '', [Validators.required]],
      lastName: [u?.lastName || '', [Validators.required]],
      phone: [u?.phone || '', [Validators.required]]
    });
    this.emailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]]
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 4000);
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;
    this.profileLoading.set(true);
    this.authService.updateProfile(this.profileForm.value)
      .then(() => {
        this.profileLoading.set(false);
        this.showToast('Profil mis à jour avec succès', 'success');
      })
      .catch((err: Error) => {
        this.profileLoading.set(false);
        this.showToast(err.message, 'error');
      });
  }

  onUpdateEmail(): void {
    if (this.emailForm.invalid) return;
    this.emailLoading.set(true);
    const { newEmail } = this.emailForm.value;
    this.authService.updateEmail(newEmail)
      .then(() => {
        this.emailLoading.set(false);
        this.emailForm.reset();
        this.showToast('Email mis à jour avec succès', 'success');
      })
      .catch((err: Error) => {
        this.emailLoading.set(false);
        this.showToast(err.message, 'error');
      });
  }

  onUpdatePassword(): void {
    if (this.passwordForm.invalid) return;
    const formValue = this.passwordForm.value;
    if (formValue.newPassword !== formValue.confirmPassword) {
      this.showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    this.passwordLoading.set(true);
    this.authService.changePassword(formValue.currentPassword, formValue.newPassword)
      .then(() => {
        this.passwordLoading.set(false);
        this.passwordForm.reset();
        this.showToast('Mot de passe changé avec succès', 'success');
      })
      .catch((err: Error) => {
        this.passwordLoading.set(false);
        this.showToast(err.message, 'error');
      });
  }
}
