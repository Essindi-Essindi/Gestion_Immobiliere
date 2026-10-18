import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EspaceLocataireService } from '@core/services/espace-locataire.service';
import { AuthService } from '@core/auth/auth.service';
import { DashboardLocataireResponse } from '@core/models/espace-locataire.model';
import { MontantPipe, DateFrPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

interface StatCardData {
  label: string;
  value: string | number;
  icon: 'logements' | 'money' | 'calendar' | 'clock';
  tone: 'primary' | 'success' | 'info' | 'warning';
}

@Component({
  selector: 'app-locataire-dashboard',
  standalone: true,
  imports: [
    RouterModule,
    MontantPipe,
    DateFrPipe,
    StateBlockComponent,
    StatCardComponent,
    PageHeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dashboard = signal<DashboardLocataireResponse | null>(null);
  loading = signal(true);
  room = signal<string | null>(null);
  error = signal<string | null>(null);

  stats = computed<StatCardData[]>(() => {
    const d = this.dashboard();
    if (!d) return [];

    return [
      {
        label: 'Mon Logement',
        value: d.logement_address || '—',
        icon: 'logements',
        tone: 'primary'
      },
      {
        label: 'Mon Loyer',
        value: `${(d.loyer || 0).toLocaleString('fr-FR')} €`,
        icon: 'money',
        tone: 'success'
      },
      {
        label: 'Dernier paiement',
        value: d.dernier_paiement ? new Date(d.dernier_paiement).toLocaleDateString('fr-FR') : 'Aucun',
        icon: 'calendar',
        tone: 'info'
      },
      {
        label: 'Prochaine échéance',
        value: d.prochaine_echeance || '—',
        icon: 'clock',
        tone: 'warning'
      }
    ];
  });

  userName = 'locataire';

  constructor(
    private espaceLocataireService: EspaceLocataireService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) this.userName = user.firstName;

    this.espaceLocataireService.profile().subscribe({
      next: (p) => this.room.set(p.piece_numero || null),
      error: () => {}
    });

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