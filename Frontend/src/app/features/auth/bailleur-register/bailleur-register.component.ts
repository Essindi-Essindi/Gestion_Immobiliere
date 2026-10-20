import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/auth/auth.service';
import { AuthAsideComponent } from '@shared/components/auth-aside/auth-aside.component';

// meme regle que le backend : 10+ caracteres, majuscule, minuscule, chiffre, special, sans espace
// same rule as the backend: 10+ chars, upper, lower, digit, special, no spaces
function strongpassword(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value || '';
  const ok = v.length >= 10 && !/\s/.test(v) && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v);
  return ok ? null : { weak: true };
}

@Component({
  selector: 'app-bailleur-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, AuthAsideComponent],
  templateUrl: './bailleur-register.component.html',
  styleUrl: './bailleur-register.component.scss'
})
export class BailleurRegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      lastName: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: [''],
      password: ['', [Validators.required, strongpassword]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.errorMessage.set('');
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      const weak = this.registerForm.get('password')?.errors?.['weak'];
      this.errorMessage.set(weak
        ? 'Mot de passe trop faible : 10 caractères minimum avec majuscule, minuscule, chiffre et caractère spécial.'
        : 'Veuillez remplir correctement tous les champs obligatoires.');
      return;
    }
    const f = this.registerForm.value;
    if (f.password !== f.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }
    this.isLoading.set(true);
    this.authService.registerBailleur({
      last_name: f.lastName, first_name: f.firstName, email: f.email, phone: f.phone,
      address: f.address || undefined, password: f.password
    }).then(() => {
      this.isLoading.set(false);
      this.registerForm.disable();
      this.successMessage.set('Votre compte est créé et actif. Redirection vers la connexion...');
      setTimeout(() => this.router.navigate(['/auth/bailleur/login']), 2500);
    }).catch((err: HttpErrorResponse) => {
      this.isLoading.set(false);
      this.errorMessage.set(err.error?.details?.[0]?.message || err.error?.message || "L'inscription a échoué. Réessayez plus tard.");
    });
  }
}
