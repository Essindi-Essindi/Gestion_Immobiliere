import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { MockAuthService } from '../../../core/services/mock-auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-locataire-password',
  standalone: true,
  imports: [FormsModule, RouterModule],
  template: `
    <div style="padding: 24px; background: #f5f5f5; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="margin-bottom: 24px;">
        <h1 style="margin: 0 0 4px; font-size: 28px; font-weight: 700; color: #000;">Créer le mot de passe</h1>
        <p style="margin: 0; color: #666; font-size: 14px;">Définissez le mot de passe initial du locataire pour activer son accès</p>
      </div>

      <div style="background: #fff; border: 1px solid #e0e0e0; max-width: 560px;">
        <div style="padding: 16px 20px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700;">
            {{ locataire()?.firstName?.charAt(0) }}{{ locataire()?.lastName?.charAt(0) }}
          </div>
          <div>
            <p style="margin: 0; font-size: 16px; font-weight: 700; color: #000;">{{ locataire()?.firstName }} {{ locataire()?.lastName }}</p>
            <p style="margin: 0; font-size: 13px; color: #666;">{{ locataire()?.email }} - {{ locataire()?.logementAddress }}{{ locataire()?.roomNumber ? ' (Ch. ' + locataire()?.roomNumber + ')' : '' }}</p>
          </div>
        </div>
        <div style="padding: 20px;">
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Mot de passe initial *</label>
            <input [(ngModel)]="password" type="password" placeholder="Minimum 6 caractères"
              style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #333;">Confirmer le mot de passe *</label>
            <input [(ngModel)]="confirmPassword" type="password" placeholder="Répétez le mot de passe"
              style="width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; font-size: 14px; box-sizing: border-box;"/>
          </div>
          @if (errorMsg()) {
            <p style="margin: 0 0 12px; font-size: 13px; color: #000; font-weight: 600; background: #f5f5f5; border: 1px solid #e0e0e0; padding: 10px 12px;">{{ errorMsg() }}</p>
          }
          <p style="margin: 0 0 16px; font-size: 12px; color: #999;">Le locataire pourra se connecter avec son email et ce mot de passe, et le changer ensuite depuis ses paramètres.</p>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button (click)="skip()" style="background: #fff; color: #000; border: 1px solid #e0e0e0; padding: 10px 16px; font-size: 13px; cursor: pointer;">Plus tard</button>
            <button (click)="save()" style="background: #000; color: #fff; border: none; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer;">Créer l'accès</button>
          </div>
        </div>
      </div>
    </div>
  `
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
