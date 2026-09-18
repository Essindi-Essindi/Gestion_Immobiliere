import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MockAuthService } from '@core/auth/mock-auth.service';

@Component({
  selector: 'app-bailleur-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './bailleur-register.component.html',
  styleUrl: './bailleur-register.component.scss'
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
