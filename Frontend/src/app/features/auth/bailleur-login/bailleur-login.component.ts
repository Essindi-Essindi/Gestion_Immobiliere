import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MockAuthService } from '@core/auth/mock-auth.service';

@Component({
  selector: 'app-bailleur-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './bailleur-login.component.html',
  styleUrl: './bailleur-login.component.scss'
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
