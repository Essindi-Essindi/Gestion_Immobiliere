import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockAuthService } from '@core/auth/mock-auth.service';

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
  newEmail = '';
  currentPassword = '';
  newPassword = '';
  accountMsg = signal('');

  subAdmins = signal<any[]>([]);
  subForm = { firstName: '', lastName: '', email: '', phone: '', password: '' };
  subMsg = signal('');

  constructor(private authService: MockAuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.currentEmail.set(user ? user.email : '');
    this.loadSubAdmins();
  }

  loadSubAdmins(): void {
    this.subAdmins.set(this.authService.getSubAdmins());
  }

  saveAccount(): void {
    if (!this.newEmail && !this.newPassword) {
      this.accountMsg.set('Renseignez un nouvel email et/ou un nouveau mot de passe.');
      return;
    }
    const tasks: Promise<void>[] = [];
    if (this.newEmail) tasks.push(this.authService.updateEmail(this.newEmail));
    if (this.newPassword) {
      if (!this.currentPassword) {
        this.accountMsg.set('Le mot de passe actuel est requis pour le changer.');
        return;
      }
      tasks.push(this.authService.changePassword(this.currentPassword, this.newPassword));
    }
    Promise.all(tasks).then(() => {
      const user = this.authService.getUser();
      this.currentEmail.set(user ? user.email : '');
      this.newEmail = '';
      this.currentPassword = '';
      this.newPassword = '';
      this.accountMsg.set('Compte administrateur mis à jour avec succès.');
    }).catch((err: Error) => {
      this.accountMsg.set(err.message);
    });
  }

  addSubAdmin(): void {
    const f = this.subForm;
    if (!f.firstName || !f.lastName || !f.email || !f.password) {
      this.subMsg.set('Prénom, nom, email et mot de passe sont obligatoires.');
      return;
    }
    this.authService.addSubAdmin(f).then(() => {
      this.subForm = { firstName: '', lastName: '', email: '', phone: '', password: '' };
      this.subMsg.set('Sous-administrateur ajouté. Il peut se connecter via la page Super Admin.');
      this.loadSubAdmins();
    }).catch((err: Error) => {
      this.subMsg.set(err.message);
    });
  }

  toggleSubAdmin(sa: any): void {
    this.authService.toggleSubAdminActive(sa.id).then(() => this.loadSubAdmins());
  }

  deleteSubAdmin(sa: any): void {
    this.authService.deleteSubAdmin(sa.id).then(() => {
      this.subMsg.set('Sous-administrateur supprimé.');
      this.loadSubAdmins();
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
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }

  resetSettings(): void {
    this.settings = {
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
  }
}
