import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockAuthService } from '@core/auth/mock-auth.service';

@Component({
  selector: 'app-super-admin-forgot',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './super-admin-forgot.component.html',
  styleUrl: './super-admin-forgot.component.scss'
})
export class SuperAdminForgotComponent {
  forgotForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: MockAuthService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    const { email } = this.forgotForm.value;
    this.authService.forgotPassword(email)
      .then(() => {
        this.successMessage.set('Un email de réinitialisation a été envoyé');
        this.isLoading.set(false);
      })
      .catch((err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      });
  }
}
