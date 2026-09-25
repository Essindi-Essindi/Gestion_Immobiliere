import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-bailleur-forgot',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './bailleur-forgot.component.html',
  styleUrl: './bailleur-forgot.component.scss'
})
export class BailleurForgotComponent {
  forgotForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
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
        this.successMessage.set('Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.');
        this.isLoading.set(false);
      })
      .catch((err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.message || 'Une erreur est survenue');
        this.isLoading.set(false);
      });
  }
}
