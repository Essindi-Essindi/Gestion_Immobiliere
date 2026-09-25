import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/auth/auth.service';
import { EspaceLocataireService } from '@core/services/espace-locataire.service';

// memes regles que le backend (MotDePasseValidator) / same rules as the backend
const commons = ['password', 'motdepasse', 'azerty', 'qwerty', '123456', 'admin', 'welcome', 'letmein'];
function strongpassword(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value || '';
  if (!v) return null;
  const ok = v.length >= 10 && new TextEncoder().encode(v).length <= 72 && !/\s/.test(v)
    && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v)
    && !commons.some(c => v.toLowerCase().includes(c));
  return ok ? null : { weak: true };
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  profileLoading = signal(false);
  passwordLoading = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  forced = signal(false);
  // seul le profil locataire a un endpoint de mise a jour cote backend / only the tenant profile has a self-update endpoint
  profileEditable: boolean;

  currentUser = this.authService.user;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private espaceLocataire: EspaceLocataireService,
    route: ActivatedRoute
  ) {
    this.forced.set(route.snapshot.queryParamMap.get('forced') === 'true');
    const u = this.authService.user();
    this.profileEditable = u?.role === 'LOCATAIRE';
    this.profileForm = this.fb.group({
      firstName: [{ value: u?.firstName || '', disabled: !this.profileEditable }, [Validators.required]],
      lastName: [{ value: u?.lastName || '', disabled: !this.profileEditable }, [Validators.required]],
      phone: [{ value: u?.phone || '', disabled: !this.profileEditable }, [Validators.required]]
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, strongpassword]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  back(): void {
    window.history.back();
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 4000);
  }

  onUpdateProfile(): void {
    if (!this.profileEditable || this.profileForm.invalid) return;
    this.profileLoading.set(true);
    const { firstName, lastName, phone } = this.profileForm.getRawValue();
    this.espaceLocataire.updateProfile({ first_name: firstName, last_name: lastName, phone }).subscribe({
      next: () => {
        this.profileLoading.set(false);
        this.showToast('Profil mis à jour avec succès', 'success');
      },
      error: (err: HttpErrorResponse) => {
        this.profileLoading.set(false);
        this.showToast(err.error?.message || 'Mise à jour impossible', 'error');
      }
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
    this.authService.changePassword({ currentPassword: formValue.currentPassword, newPassword: formValue.newPassword })
      .then(() => {
        this.passwordLoading.set(false);
        this.passwordForm.reset();
        this.forced.set(false);
        this.showToast('Mot de passe changé avec succès', 'success');
      })
      .catch((err: HttpErrorResponse) => {
        this.passwordLoading.set(false);
        this.showToast(err.error?.message || 'Mot de passe actuel incorrect', 'error');
      });
  }
}
