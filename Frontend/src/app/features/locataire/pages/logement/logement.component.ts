import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { EspaceLocataireService } from '@core/services/espace-locataire.service';
import { MontantPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-logement',
  standalone: true,
  imports: [RouterModule, MontantPipe, StateBlockComponent],
  templateUrl: './logement.component.html'
})
export class LogementComponent implements OnInit {
  logement: any = {};
  locataire: any = null;
  colocataires: any[] = [];
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private espaceLocataireService: EspaceLocataireService) {}

  ngOnInit(): void {
    forkJoin({
      l: this.espaceLocataireService.logement(),
      p: this.espaceLocataireService.profile(),
      c: this.espaceLocataireService.contrat().pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ l, p, c }) => {
        this.locataire = { id: String(p.id), roomNumber: p.piece_numero };
        this.logement = {
          status: l.status, type: l.type, surface: l.area, rent: l.rent, charges: l.charges, deposit: c?.deposit ?? 0,
          address: { street: l.address, city: l.city, postalCode: l.postal_code },
          pieces: (l.pieces || []).map(x => ({ numero: x.numero, type: x.type, capacite: x.capacite, occupants: x.occupants || [] }))
        };
        // colocataires = occupants des chambres sauf moi / roommates = room occupants except me
        this.colocataires = (l.pieces || []).flatMap(x => (x.occupants || [])
          .filter(o => String(o.locataire_id) !== this.locataire.id)
          .map(o => ({ id: o.locataire_id, firstName: o.nom, roomNumber: x.numero })));
        this.loading.set(false);
      },
      error: () => { this.error.set('Impossible de charger votre logement.'); this.loading.set(false); }
    });
  }

  statusLabel(s: string): string {
    switch (s) {
      case 'LOUE': return 'Loué';
      case 'VACANT': return 'Vacant';
      default: return s || '';
    }
  }
  pieceTypeLabel(t: string): string {
    const map: Record<string, string> = { CHAMBRE: 'Chambre', SALON: 'Salon', CUISINE: 'Cuisine', SALLE_DE_BAIN: 'Salle de bain', BUREAU: 'Bureau', AUTRE: 'Autre' };
    return map[t] || t;
  }
}
