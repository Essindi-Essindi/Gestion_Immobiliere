import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MockAuthService } from '@core/auth/mock-auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
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
