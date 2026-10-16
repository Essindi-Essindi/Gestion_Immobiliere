import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthAsideComponent } from '@shared/components/auth-aside/auth-aside.component';

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
  // l'inscription en self-service n'existe pas cote backend, les bailleurs sont crees par un admin
  // self-service registration has no backend endpoint, bailleurs are created by an admin
  errorMessage = signal("L'inscription en ligne n'est pas disponible pour le moment. Contactez un administrateur pour créer votre compte bailleur.");

  constructor(private fb: FormBuilder) {
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
    // formulaire volontairement non branche, cf errorMessage
  }
}
