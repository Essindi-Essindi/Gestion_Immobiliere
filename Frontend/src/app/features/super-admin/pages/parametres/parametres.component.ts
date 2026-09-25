import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/auth/auth.service';
import { AdminService } from '@core/services/admin.service';
import { AdminPlateformeService } from '@core/services/admin-plateforme.service';
import { AdminResponse } from '@core/models/admin.model';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.scss'
})
export class ParametresComponent implements OnInit {
  showToast = signal(false);

  currentEmail = signal('');
  currentPassword = '';
  newPassword = '';
  accountMsg = signal('');

  subAdmins = signal<AdminResponse[]>([]);
  subLoading = signal(true);
  subForm = { firstName: '', lastName: '', email: '', password: '' };
  subMsg = signal('');

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private adminPlateforme: AdminPlateformeService
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    this.currentEmail.set(user ? user.email : '');
    this.loadSubAdmins();
    this.loadParametres();
  }

  loadSubAdmins(): void {
    this.subLoading.set(true);
    this.adminService.getAll().subscribe({
      next: (list) => {
        this.subAdmins.set(list);
        this.subLoading.set(false);
      },
      error: () => this.subLoading.set(false)
    });
  }

  loadParametres(): void {
    this.adminPlateforme.parametres().subscribe({
      next: (p) => {
        this.settings = {
          platformName: p.platform_name,
          supportEmail: p.support_email,
          currency: p.currency,
          timezone: p.timezone,
          maintenanceMode: p.maintenance_mode,
          emailNotifications: p.email_notifications,
          openRegistration: p.open_registration,
          maxLogementsBasic: p.max_logements_basic,
          maxLogementsPremium: p.max_logements_premium,
          maxUploadSize: p.max_upload_size_mb,
          sessionDuration: p.session_duration_minutes
        };
      },
      error: () => {}
    });
  }

  saveAccount(): void {
    if (!this.newPassword) {
      this.accountMsg.set('Renseignez un nouveau mot de passe.');
      return;
    }
    if (!this.currentPassword) {
      this.accountMsg.set('Le mot de passe actuel est requis pour le changer.');
      return;
    }
    this.authService.changePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword })
      .then(() => {
        this.currentPassword = '';
        this.newPassword = '';
        this.accountMsg.set('Mot de passe mis à jour avec succès.');
      })
      .catch((err: HttpErrorResponse) => {
        this.accountMsg.set(err.error?.message || 'Mot de passe actuel incorrect');
      });
  }

  addSubAdmin(): void {
    const f = this.subForm;
    if (!f.firstName || !f.lastName || !f.email || !f.password) {
      this.subMsg.set('Prénom, nom, email et mot de passe sont obligatoires.');
      return;
    }
    this.adminService.create({ last_name: f.lastName, first_name: f.firstName, email: f.email, password: f.password, access_level: 'SUPER_ADMIN' }).subscribe({
      next: () => {
        this.subForm = { firstName: '', lastName: '', email: '', password: '' };
        this.subMsg.set('Sous-administrateur ajouté. Il peut se connecter via la page Super Admin.');
        this.loadSubAdmins();
      },
      error: (err: HttpErrorResponse) => this.subMsg.set(err.error?.message || 'Création impossible')
    });
  }

  deleteSubAdmin(sa: AdminResponse): void {
    this.adminService.delete(sa.id).subscribe({
      next: () => {
        this.subMsg.set('Sous-administrateur supprimé.');
        this.loadSubAdmins();
      },
      error: (err: HttpErrorResponse) => this.subMsg.set(err.error?.message || 'Suppression impossible')
    });
  }

  settings = {
    platformName: 'Gestion Immobilière',
    supportEmail: 'support@gestion-immo.com',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    maintenanceMode: false,
    emailNotifications: true,
    openRegistration: true,
    maxLogementsBasic: 5,
    maxLogementsPremium: 25,
    maxUploadSize: 10,
    sessionDuration: 60
  };

  saveSettings(): void {
    const s = this.settings;
    this.adminPlateforme.updateParametres({
      platform_name: s.platformName,
      support_email: s.supportEmail,
      currency: s.currency,
      timezone: s.timezone,
      maintenance_mode: s.maintenanceMode,
      email_notifications: s.emailNotifications,
      open_registration: s.openRegistration,
      max_logements_basic: Number(s.maxLogementsBasic),
      max_logements_premium: Number(s.maxLogementsPremium),
      max_upload_size_mb: Number(s.maxUploadSize),
      session_duration_minutes: Number(s.sessionDuration)
    }).subscribe({
      next: () => {
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 3000);
      },
      error: () => {}
    });
  }

  resetSettings(): void {
    this.adminPlateforme.resetParametres().subscribe({
      next: () => this.loadParametres(),
      error: () => {}
    });
  }
}
