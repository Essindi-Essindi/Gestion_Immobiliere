import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { AuthService } from '@core/auth/auth.service';
import { formatDate } from '@shared/utils/format';
import { MontantPipe } from '@shared/pipes';

@Component({
  selector: 'app-locataire-dashboard',
  standalone: true,
  imports: [RouterModule, MontantPipe],
  template: `
    <div style="padding:24px;background:#f5f5f5;min-height:100vh;">
      <div style="margin-bottom:24px;">
        <h1 style="margin:0 0 4px;font-size:24px;font-weight:700;color:#000;">Bonjour, {{ userName }}</h1>
        <p style="margin:0;color:#757575;font-size:14px;">Bienvenue dans votre espace locataire</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:24px;">
        <div style="background:#fff;border:1px solid #e0e0e0;padding:20px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;background:#000;display:flex;align-items:center;justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 0 2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <p style="margin:0;font-size:22px;font-weight:700;color:#000;">{{ stats.monLogement.type }}</p>
              <p style="margin:0;font-size:13px;color:#757575;">Mon Logement
                @if (stats.monLogement.room) {
                  <span style="background:#000;color:#fff;font-size:10px;padding:2px 6px;font-weight:600;margin-left:4px;">{{ stats.monLogement.room }}</span>
                }
              </p>
            </div>
          </div>
        </div>
        <div style="background:#fff;border:1px solid #e0e0e0;padding:20px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;background:#424242;display:flex;align-items:center;justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <p style="margin:0;font-size:22px;font-weight:700;color:#000;">{{ stats.monLoyer | montant }} €</p>
              <p style="margin:0;font-size:13px;color:#757575;">Mon Loyer</p>
            </div>
          </div>
        </div>
        <div style="background:#fff;border:1px solid #e0e0e0;padding:20px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;background:#616161;display:flex;align-items:center;justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <p style="margin:0;font-size:22px;font-weight:700;color:#000;">{{ stats.dernierPaiement }}</p>
              <p style="margin:0;font-size:13px;color:#757575;">Dernier paiement</p>
            </div>
          </div>
        </div>
        <div style="background:#fff;border:1px solid #e0e0e0;padding:20px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;background:#333;display:flex;align-items:center;justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="0"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <p style="margin:0;font-size:22px;font-weight:700;color:#000;">{{ stats.prochaineEcheance }}</p>
              <p style="margin:0;font-size:13px;color:#757575;">Prochaine échéance</p>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
        <div style="background:#fff;border:1px solid #e0e0e0;">
          <div style="padding:16px 20px;border-bottom:1px solid #e0e0e0;">
            <h2 style="margin:0;font-size:16px;font-weight:600;color:#000;">Mon Contrat</h2>
          </div>
          <div style="padding:20px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <p style="margin:0 0 4px;font-size:12px;color:#757575;text-transform:uppercase;">Logement</p>
                <p style="margin:0;font-size:14px;color:#000;font-weight:500;">{{ stats.contrat.logementAddress }}</p>
              </div>
              <div>
                <p style="margin:0 0 4px;font-size:12px;color:#757575;text-transform:uppercase;">Loyer mensuel</p>
                <p style="margin:0;font-size:14px;color:#000;font-weight:500;">{{ stats.contrat.rent | montant }} €</p>
              </div>
              <div>
                <p style="margin:0 0 4px;font-size:12px;color:#757575;text-transform:uppercase;">Début</p>
                <p style="margin:0;font-size:14px;color:#000;font-weight:500;">{{ stats.contrat.startDate }}</p>
              </div>
              <div>
                <p style="margin:0 0 4px;font-size:12px;color:#757575;text-transform:uppercase;">Fin</p>
                <p style="margin:0;font-size:14px;color:#000;font-weight:500;">{{ stats.contrat.endDate }}</p>
              </div>
            </div>
            <a routerLink="/locataire/contrat" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#000;color:#fff;border:none;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;">Voir le contrat</a>
          </div>
        </div>

        <div style="background:#fff;border:1px solid #e0e0e0;">
          <div style="padding:16px 20px;border-bottom:1px solid #e0e0e0;">
            <h2 style="margin:0;font-size:16px;font-weight:600;color:#000;">Notifications récentes</h2>
          </div>
          <div style="padding:12px 20px;">
            @for (notif of stats.notifications; track notif.id) {
              <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid #f0f0f0;" [style.background]="notif.isRead ? 'transparent' : '#fafafa'">
                <div style="width:36px;height:36px;background:#e0e0e0;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#424242" stroke-width="2">
                    @if (notif.icon === 'clock') { <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/> }
                    @else if (notif.icon === 'check') { <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/> }
                    @else if (notif.icon === 'info') { <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/> }
                    @else { <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/> }
                  </svg>
                </div>
                <div style="flex:1;min-width:0;">
                  <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#000;">{{ notif.title }}</p>
                  <p style="margin:0 0 4px;font-size:12px;color:#616161;">{{ notif.message }}</p>
                  <span style="font-size:11px;color:#9e9e9e;">{{ notif.createdAt }}</span>
                </div>
                @if (!notif.isRead) {
                  <div style="width:8px;height:8px;background:#000;flex-shrink:0;margin-top:6px;"></div>
                }
              </div>
            }
            <a routerLink="/locataire/notifications" style="display:inline-block;margin-top:12px;font-size:13px;color:#000;font-weight:500;text-decoration:none;">Voir toutes les notifications →</a>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <a routerLink="/locataire/problemes" style="display:flex;align-items:center;justify-content:center;gap:10px;padding:16px;background:#000;color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Signaler un problème
        </a>
        <a routerLink="/locataire/paiements" style="display:flex;align-items:center;justify-content:center;gap:10px;padding:16px;background:#fff;color:#000;border:1px solid #e0e0e0;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="0"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          Voir mes paiements
        </a>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  userName = 'Jean';
  stats: any = {
    monLogement: { type: '-', room: '' },
    monLoyer: 0,
    dernierPaiement: '-',
    prochaineEcheance: '-',
    contrat: { logementAddress: '-', rent: 0, startDate: '-', endDate: '-' },
    notifications: []
  };

  months = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  constructor(private mockDataService: MockDataService, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) this.userName = user.firstName;
    const loc = this.mockDataService.resolveLocataireForUser(user);
    if (!loc) return;

    const logement = this.mockDataService.getById('logements', loc.logementId);
    const contrat = this.mockDataService.getContratForLocataire(loc.id);
    const paiements = this.mockDataService.getPaiementsForLocataire(loc.id).filter((p: any) => p.type === 'LOYER');
    const payes = paiements.filter((p: any) => p.status === 'PAYE' && p.paidAt)
      .sort((a: any, b: any) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
    const prochain = paiements.find((p: any) => p.status === 'EN_ATTENTE' || p.status === 'EN_RETARD');
    const notifs = this.mockDataService.getAll('notifications').slice(0, 3).map((n: any) => ({
      ...n,
      icon: n.type === 'SUCCESS' ? 'check' : n.type === 'INFO' ? 'info' : n.type === 'WARNING' ? 'clock' : 'alert',
      createdAt: this.timeAgo(n.createdAt)
    }));

    this.stats = {
      monLogement: { type: logement ? logement.type : '-', room: loc.roomNumber || '' },
      monLoyer: contrat ? contrat.rent : (logement ? logement.rent : 0),
      dernierPaiement: payes.length ? formatDate(payes[0].paidAt) : 'Aucun',
      prochaineEcheance: prochain ? this.months[prochain.month] + ' ' + prochain.year : '-',
      contrat: contrat ? {
        logementAddress: contrat.logementAddress,
        rent: contrat.rent,
        startDate: formatDate(contrat.startDate),
        endDate: formatDate(contrat.endDate)
      } : { logementAddress: '-', rent: 0, startDate: '-', endDate: '-' },
      notifications: notifs
    };
  }

  timeAgo(date: any): string {
    const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diffDays <= 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays}j`;
  }
}
