import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { AuthService } from '@core/auth/auth.service';
import { MontantPipe } from '@shared/pipes';

@Component({
  selector: 'app-logement',
  standalone: true,
  imports: [RouterModule, MontantPipe],
  templateUrl: './logement.component.html'
})
export class LogementComponent implements OnInit {
  logement: any = {};
  locataire: any = null;
  colocataires: any[] = [];

  constructor(private mockDataService: MockDataService, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.user();
    this.locataire = this.mockDataService.resolveLocataireForUser(user);
    if (this.locataire) {
      this.logement = this.mockDataService.getById('logements', this.locataire.logementId) || {};
      this.colocataires = this.mockDataService.getAll('locataires')
        .filter((l: any) => l.id !== this.locataire.id && l.logementId === this.locataire.logementId);
    }
  }

  statusLabel(s: string): string {
    switch (s) {
      case 'LOUE': return 'Loué';
      case 'VACANT': return 'Vacant';
      case 'EN_TRAVAUX': return 'En travaux';
      default: return s || '';
    }
  }
  pieceTypeLabel(t: string): string {
    const map: Record<string, string> = { CHAMBRE: 'Chambre', SALON: 'Salon', CUISINE: 'Cuisine', SALLE_DE_BAIN: 'Salle de bain', BUREAU: 'Bureau', AUTRE: 'Autre' };
    return map[t] || t;
  }
}
