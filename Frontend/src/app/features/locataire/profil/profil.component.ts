import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div style="padding:24px;background:#f5f5f5;min-height:100vh;">
      <div style="margin-bottom:24px;">
        <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:#000;">Mon Profil</h1>
        <p style="margin:0;color:#757575;font-size:14px;">Gérez vos informations personnelles</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 2fr;gap:16px;margin-bottom:24px;">
        <div style="background:#fff;border:1px solid #e0e0e0;">
          <div style="padding:24px;text-align:center;">
            <div style="width:80px;height:80px;background:#e0e0e0;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#000;">{{ profile.firstName }} {{ profile.lastName }}</p>
            <p style="margin:0 0 4px;font-size:14px;color:#616161;">{{ profile.email }}</p>
            <p style="margin:0;font-size:14px;color:#9e9e9e;">{{ profile.phone }}</p>
          </div>
        </div>

        <div style="background:#fff;border:1px solid #e0e0e0;">
          <div style="padding:16px 20px;border-bottom:1px solid #e0e0e0;">
            <h2 style="margin:0;font-size:16px;font-weight:600;color:#000;">Informations personnelles</h2>
          </div>
          <div style="padding:20px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;margin-bottom:6px;font-size:13px;color:#616161;font-weight:500;">Nom</label>
                <input type="text" [(ngModel)]="profile.lastName" style="width:100%;padding:10px 12px;border:1px solid #e0e0e0;font-size:14px;background:#fff;color:#000;box-sizing:border-box;" />
              </div>
              <div>
                <label style="display:block;margin-bottom:6px;font-size:13px;color:#616161;font-weight:500;">Prénom</label>
                <input type="text" [(ngModel)]="profile.firstName" style="width:100%;padding:10px 12px;border:1px solid #e0e0e0;font-size:14px;background:#fff;color:#000;box-sizing:border-box;" />
              </div>
              <div>
                <label style="display:block;margin-bottom:6px;font-size:13px;color:#616161;font-weight:500;">Email</label>
                <input type="email" [(ngModel)]="profile.email" style="width:100%;padding:10px 12px;border:1px solid #e0e0e0;font-size:14px;background:#fff;color:#000;box-sizing:border-box;" />
              </div>
              <div>
                <label style="display:block;margin-bottom:6px;font-size:13px;color:#616161;font-weight:500;">Téléphone</label>
                <input type="tel" [(ngModel)]="profile.phone" style="width:100%;padding:10px 12px;border:1px solid #e0e0e0;font-size:14px;background:#fff;color:#000;box-sizing:border-box;" />
              </div>
              <div style="grid-column:1/3;">
                <label style="display:block;margin-bottom:6px;font-size:13px;color:#616161;font-weight:500;">Mot de passe</label>
                <input type="password" [(ngModel)]="password" placeholder="••••••••" style="width:100%;padding:10px 12px;border:1px solid #e0e0e0;font-size:14px;background:#fff;color:#000;box-sizing:border-box;" />
              </div>
            </div>
            <button (click)="sauvegarder()" style="padding:10px 24px;background:#000;color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer;">Sauvegarder</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfilComponent implements OnInit {
  profile = { firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@email.com', phone: '+33 6 12 34 56 78' };
  password = '';

  constructor(private authService: AuthService, private toastService: ToastService) {}

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.profile = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '+33 6 12 34 56 78'
      };
    }
  }

  sauvegarder(): void {
    this.toastService.success('Profil', 'Vos informations ont été mises à jour');
  }
}
