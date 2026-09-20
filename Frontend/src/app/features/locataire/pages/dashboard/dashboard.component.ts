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
  templateUrl: './dashboard.component.html'
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
