import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, authErrorMessage } from '@core/auth/auth.service';

@Component({
  selector: 'app-super-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './super-admin-login.component.html',
  styleUrl: './super-admin-login.component.scss'
})
export class SuperAdminLoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
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
    this.authService.login({ email, password })
      .then((user) => {
        if (user.role !== 'SUPER_ADMIN') {
          this.authService.logout();
          this.errorMessage.set("Ce compte n'est pas un compte administrateur");
          this.isLoading.set(false);
          return;
        }
        if (this.authService.mustChangePassword()) {
          this.router.navigate(['/super-admin/settings'], { queryParams: { forced: true } });
          return;
        }
        this.router.navigate(['/super-admin/dashboard']);
      })
      .catch((err: HttpErrorResponse) => {
        this.errorMessage.set(authErrorMessage(err));
        this.isLoading.set(false);
      });
  }
}
