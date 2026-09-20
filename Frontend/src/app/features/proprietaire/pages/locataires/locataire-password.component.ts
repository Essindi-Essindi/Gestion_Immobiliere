import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { MockAuthService } from '@core/auth/mock-auth.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-locataire-password',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './locataire-password.component.html'
})
export class LocatairePasswordComponent implements OnInit {
  locataire = signal<any>(null);
  password = '';
  confirmPassword = '';
  errorMsg = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mockData: MockDataService,
    private mockAuth: MockAuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.locataire.set(this.mockData.getById('locataires', id));
    }
  }

  skip(): void {
    this.router.navigate(['/proprietaire/locataires']);
  }

  save(): void {
    this.errorMsg.set('');
    if (!this.password || this.password.length < 6) {
      this.errorMsg.set('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg.set('Les mots de passe ne correspondent pas.');
      return;
    }
    const loc = this.locataire();
    if (!loc) {
      this.errorMsg.set('Locataire introuvable.');
      return;
    }
    this.mockAuth.createUserAccount({
      firstName: loc.firstName,
      lastName: loc.lastName,
      email: loc.email,
      phone: loc.phone,
      password: this.password,
      role: 'LOCATAIRE'
    }).then(() => {
      this.toast.success('Accès créé', `${loc.firstName} ${loc.lastName} peut désormais se connecter avec son email`);
      this.router.navigate(['/proprietaire/locataires']);
    }).catch((err: Error) => {
      this.errorMsg.set(err.message);
    });
  }
}
