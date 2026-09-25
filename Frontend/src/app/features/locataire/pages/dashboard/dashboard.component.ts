import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EspaceLocataireService } from '@core/services/espace-locataire.service';
import { AuthService } from '@core/auth/auth.service';
import { DashboardLocataireResponse } from '@core/models/espace-locataire.model';
import { MontantPipe, DateFrPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-locataire-dashboard',
  standalone: true,
  imports: [RouterModule, MontantPipe, DateFrPipe, StateBlockComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  userName = 'locataire';
  dashboard = signal<DashboardLocataireResponse | null>(null);
  loading = signal(true);
  room = signal<string | null>(null);
  error = signal<string | null>(null);

  constructor(private espaceLocataireService: EspaceLocataireService, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) this.userName = user.firstName;

    this.espaceLocataireService.profile().subscribe({ next: (p) => this.room.set(p.piece_numero || null), error: () => {} });
    this.espaceLocataireService.dashboard().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger votre tableau de bord.');
        this.loading.set(false);
      }
    });
  }

  timeAgo(date: string): string {
    const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diffDays <= 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays}j`;
  }
}
