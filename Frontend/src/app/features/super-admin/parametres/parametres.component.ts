import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockAuthService } from '../../../core/services/mock-auth.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Paramètres système</h1>
          <p>Configuration générale de la plateforme</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Informations générales</h2>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nom de la plateforme</label>
              <input type="text" [(ngModel)]="settings.platformName">
            </div>
            <div class="form-group">
              <label>Email de support</label>
              <input type="email" [(ngModel)]="settings.supportEmail">
            </div>
            <div class="form-group">
              <label>Devise par défaut</label>
              <select [(ngModel)]="settings.currency">
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dollar américain</option>
                <option value="XAF">XAF - Franc CFA</option>
                <option value="GBP">GBP - Livre sterling</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fuseau horaire</label>
              <select [(ngModel)]="settings.timezone">
                <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                <option value="Africa/Douala">Africa/Douala (UTC+1)</option>
                <option value="Africa/Lagos">Africa/Lagos (UTC+1)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Maintenance</h2>
        </div>
        <div class="card-body">
          <div class="toggle-row">
            <div class="toggle-info">
              <span class="toggle-label">Mode maintenance</span>
              <span class="toggle-desc">Active le mode maintenance. Seuls les administrateurs pourront se connecter.</span>
            </div>
            <button class="toggle-btn" [class.on]="settings.maintenanceMode" (click)="settings.maintenanceMode = !settings.maintenanceMode">
              <div class="toggle-track">
                <div class="toggle-thumb"></div>
              </div>
              <span>{{ settings.maintenanceMode ? 'Activé' : 'Désactivé' }}</span>
            </button>
          </div>
          <div class="toggle-row">
            <div class="toggle-info">
              <span class="toggle-label">Notifications email</span>
              <span class="toggle-desc">Envoyer des notifications par email aux utilisateurs.</span>
            </div>
            <button class="toggle-btn" [class.on]="settings.emailNotifications" (click)="settings.emailNotifications = !settings.emailNotifications">
              <div class="toggle-track">
                <div class="toggle-thumb"></div>
              </div>
              <span>{{ settings.emailNotifications ? 'Activé' : 'Désactivé' }}</span>
            </button>
          </div>
          <div class="toggle-row">
            <div class="toggle-info">
              <span class="toggle-label">Inscription ouverte</span>
              <span class="toggle-desc">Permettre à de nouveaux utilisateurs de s'inscrire.</span>
            </div>
            <button class="toggle-btn" [class.on]="settings.openRegistration" (click)="settings.openRegistration = !settings.openRegistration">
              <div class="toggle-track">
                <div class="toggle-thumb"></div>
              </div>
              <span>{{ settings.openRegistration ? 'Activé' : 'Désactivé' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Limites de la plateforme</h2>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Max logements par propriétaire (Basic)</label>
              <input type="number" [(ngModel)]="settings.maxLogementsBasic">
            </div>
            <div class="form-group">
              <label>Max logements par propriétaire (Premium)</label>
              <input type="number" [(ngModel)]="settings.maxLogementsPremium">
            </div>
            <div class="form-group">
              <label>Taille max upload (MB)</label>
              <input type="number" [(ngModel)]="settings.maxUploadSize">
            </div>
            <div class="form-group">
              <label>Durée session (minutes)</label>
              <input type="number" [(ngModel)]="settings.sessionDuration">
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Compte administrateur</h2>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Email actuel</label>
              <input type="email" [value]="currentEmail()" readonly style="background: #f5f5f5;">
            </div>
            <div class="form-group">
              <label>Nouvel email</label>
              <input type="email" [(ngModel)]="newEmail" placeholder="nouveau@email.com">
            </div>
            <div class="form-group">
              <label>Mot de passe actuel</label>
              <input type="password" [(ngModel)]="currentPassword" placeholder="••••••••">
            </div>
            <div class="form-group">
              <label>Nouveau mot de passe</label>
              <input type="password" [(ngModel)]="newPassword" placeholder="••••••••">
            </div>
          </div>
          @if (accountMsg()) {
            <p class="msg">{{ accountMsg() }}</p>
          }
          <div class="row-end">
            <button class="btn-save" (click)="saveAccount()">Mettre à jour le compte</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Sous-administrateurs</h2>
        </div>
        <div class="card-body">
          <p class="hint">Les sous-administrateurs se connectent via la page de connexion Super Admin et peuvent vous aider à gérer le système.</p>
          <div class="form-grid">
            <div class="form-group">
              <label>Prénom *</label>
              <input type="text" [(ngModel)]="subForm.firstName" placeholder="Prénom">
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" [(ngModel)]="subForm.lastName" placeholder="Nom">
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" [(ngModel)]="subForm.email" placeholder="sous.admin@email.com">
            </div>
            <div class="form-group">
              <label>Téléphone</label>
              <input type="text" [(ngModel)]="subForm.phone" placeholder="+237 ...">
            </div>
            <div class="form-group">
              <label>Mot de passe *</label>
              <input type="password" [(ngModel)]="subForm.password" placeholder="••••••••">
            </div>
          </div>
          @if (subMsg()) {
            <p class="msg">{{ subMsg() }}</p>
          }
          <div class="row-end">
            <button class="btn-save" (click)="addSubAdmin()">+ Ajouter un sous-admin</button>
          </div>

          <div class="sub-list">
            @if (subAdmins().length === 0) {
              <p class="muted">Aucun sous-administrateur pour le moment.</p>
            } @else {
              @for (sa of subAdmins(); track sa.id) {
                <div class="sub-row">
                  <div class="sub-info">
                    <span class="sub-name">{{ sa.firstName }} {{ sa.lastName }}</span>
                    <span class="sub-email">{{ sa.email }}</span>
                  </div>
                  <span class="status" [class.active]="sa.isActive" [class.inactive]="!sa.isActive">
                    {{ sa.isActive ? 'Actif' : 'Désactivé' }}
                  </span>
                  <div class="sub-actions">
                    <button class="btn-mini" (click)="toggleSubAdmin(sa)">{{ sa.isActive ? 'Désactiver' : 'Activer' }}</button>
                    <button class="btn-mini danger" (click)="deleteSubAdmin(sa)">Supprimer</button>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      </div>

      <div class="actions-bar">
        <button class="btn-reset" (click)="resetSettings()">Réinitialiser</button>
        <button class="btn-save" (click)="saveSettings()">Sauvegarder</button>
      </div>

      @if (showToast()) {
        <div class="toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Paramètres sauvegardés avec succès</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; background: #f5f5f5; min-height: 100vh; position: relative; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #000; font-family: inherit; }
    .page-header p { margin: 0; font-size: 14px; color: #666; font-family: inherit; }
    .card { background: #fff; border: 1px solid #e0e0e0; margin-bottom: 16px; }
    .card-header { padding: 16px 20px; border-bottom: 1px solid #e0e0e0; }
    .card-header h2 { margin: 0; font-size: 15px; font-weight: 600; color: #000; font-family: inherit; }
    .card-body { padding: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.03em; }
    .form-group input, .form-group select { padding: 10px 12px; border: 1px solid #e0e0e0; font-size: 14px; color: #000; font-family: inherit; background: #fff; outline: none; }
    .form-group input:focus, .form-group select:focus { border-color: #000; }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
    .toggle-row:last-child { border-bottom: none; }
    .toggle-info { display: flex; flex-direction: column; gap: 2px; }
    .toggle-label { font-size: 14px; font-weight: 600; color: #000; }
    .toggle-desc { font-size: 12px; color: #999; }
    .toggle-btn { display: flex; align-items: center; gap: 10px; border: none; background: none; cursor: pointer; font-family: inherit; font-size: 12px; color: #666; font-weight: 500; }
    .toggle-btn.on { color: #000; }
    .toggle-track { width: 40px; height: 22px; background: #e0e0e0; position: relative; transition: background 0.2s; }
    .toggle-btn.on .toggle-track { background: #000; }
    .toggle-thumb { width: 16px; height: 16px; background: #fff; position: absolute; top: 3px; left: 3px; transition: left 0.2s; }
    .toggle-btn.on .toggle-thumb { left: 21px; }
    .actions-bar { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .btn-save { padding: 10px 24px; font-size: 13px; font-weight: 600; border: 1px solid #000; background: #000; color: #fff; cursor: pointer; font-family: inherit; }
    .btn-save:hover { background: #222; }
    .btn-reset { padding: 10px 24px; font-size: 13px; font-weight: 500; border: 1px solid #e0e0e0; background: #fff; color: #000; cursor: pointer; font-family: inherit; }
    .btn-reset:hover { background: #f5f5f5; }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #000; color: #fff; padding: 12px 20px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; z-index: 1000; }
    .hint { margin: 0 0 16px; font-size: 13px; color: #666; }
    .muted { font-size: 13px; color: #999; }
    .msg { margin: 0 0 12px; font-size: 13px; color: #000; font-weight: 500; }
    .row-end { display: flex; justify-content: flex-end; margin-top: 4px; }
    .sub-list { margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .sub-row { display: flex; align-items: center; gap: 12px; border: 1px solid #e0e0e0; padding: 10px 14px; }
    .sub-info { flex: 1; display: flex; flex-direction: column; }
    .sub-name { font-size: 14px; font-weight: 600; color: #000; }
    .sub-email { font-size: 12px; color: #666; }
    .status { font-size: 11px; font-weight: 600; padding: 3px 10px; }
    .status.active { background: #000; color: #fff; }
    .status.inactive { background: #e0e0e0; color: #666; }
    .sub-actions { display: flex; gap: 6px; }
    .btn-mini { padding: 5px 10px; font-size: 12px; border: 1px solid #e0e0e0; background: #fff; color: #000; cursor: pointer; font-family: inherit; }
    .btn-mini:hover { background: #f5f5f5; }
    .btn-mini.danger:hover { background: #000; color: #fff; border-color: #000; }
    @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
  `]
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
