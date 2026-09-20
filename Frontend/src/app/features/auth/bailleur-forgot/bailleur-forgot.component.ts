import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockAuthService } from '@core/auth/mock-auth.service';

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
      .then((msg) => {
        this.successMessage.set('Un email de réinitialisation a été envoyé');
        this.isLoading.set(false);
      })
      .catch((err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      });
  }
}
