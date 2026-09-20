import { Component, signal, computed } from '@angular/core';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  change: string;
  changeUp: boolean;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'create' | 'update' | 'delete' | 'login';
}

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  stats = signal<StatCard[]>([
    { label: 'Total Propriétaires', value: '142', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>', change: '+12%', changeUp: true },
    { label: 'Total Locataires', value: '387', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>', change: '+8%', changeUp: true },
    { label: 'Total Logements', value: '256', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>', change: '+5%', changeUp: true },
    { label: 'Revenus Mensuels', value: '24 850 €', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>', change: '+18%', changeUp: true }
  ]);

  activities = signal<Activity[]>([
    { id: 1, user: 'Jean Dupont', action: 'a créé le logement', target: 'Appartement T3 - Yaoundé', time: 'Il y a 12 min', type: 'create' },
    { id: 2, user: 'Marie Ngo', action: 'a mis à jour son profil', target: '', time: 'Il y a 34 min', type: 'update' },
    { id: 3, user: 'Super Admin', action: 's\'est connecté', target: '', time: 'Il y a 1h', type: 'login' },
    { id: 4, user: 'Paul Mbarga', action: 'a supprimé le contrat', target: '#CTR-2024-089', time: 'Il y a 2h', type: 'delete' },
    { id: 5, user: 'Sophie Kamga', action: 'a créé le locataire', target: 'Ahmadou Bello', time: 'Il y a 3h', type: 'create' },
    { id: 6, user: 'Claire Fotsing', action: 's\'est connectée', target: '', time: 'Il y a 3h', type: 'login' },
    { id: 7, user: 'Olivier Tchinda', action: 'a modifié le loyer', target: 'Maison T3 - Bafoussam', time: 'Il y a 5h', type: 'update' },
    { id: 8, user: 'Marie Ndjock', action: 'a créé le contrat', target: '#CTR-2024-112', time: 'Il y a 6h', type: 'create' },
    { id: 9, user: 'Ahmed Bello', action: 's\'est connecté', target: '', time: 'Hier', type: 'login' },
    { id: 10, user: 'Fatima Aloui', action: 'a mis à jour son profil', target: '', time: 'Hier', type: 'update' },
    { id: 11, user: 'Super Admin', action: 'a suspendu le compte', target: 'Paul Mbarga', time: 'Hier', type: 'update' },
    { id: 12, user: 'Jean Dupont', action: 'a généré la quittance', target: 'Septembre 2026', time: 'Hier', type: 'create' },
    { id: 13, user: 'Sandrine Kamga', action: 's\'est connectée', target: '', time: 'Il y a 2j', type: 'login' },
    { id: 14, user: 'Felix Tchidjou', action: 'a signalé un problème', target: 'Appartement T2 - Nkolbisson', time: 'Il y a 2j', type: 'create' },
    { id: 15, user: 'Amina Bello', action: 'a payé son loyer', target: 'Maison T3 - Bafoussam', time: 'Il y a 2j', type: 'update' },
    { id: 16, user: 'Omarou Saidou', action: 's\'est connecté', target: '', time: 'Il y a 3j', type: 'login' },
    { id: 17, user: 'Ibrahim Moussa', action: 'a supprimé le document', target: 'Bail-2023.pdf', time: 'Il y a 3j', type: 'delete' },
    { id: 18, user: 'Super Admin', action: 'a modifié le plan', target: 'Premium', time: 'Il y a 4j', type: 'update' }
  ]);

  showActivityModal = signal(false);
  activityPage = signal(1);
  activityPageSize = 8;
  totalActivityPages = computed(() => Math.max(1, Math.ceil(this.activities().length / this.activityPageSize)));
  pagedActivities = computed(() => {
    const start = (this.activityPage() - 1) * this.activityPageSize;
    return this.activities().slice(start, start + this.activityPageSize);
  });

  barData = signal([
    { label: 'Mar', value: '14k€', height: 55 },
    { label: 'Avr', value: '16k€', height: 63 },
    { label: 'Mai', value: '18k€', height: 70 },
    { label: 'Jun', value: '15k€', height: 59 },
    { label: 'Jul', value: '19k€', height: 74 },
    { label: 'Aoû', value: '22k€', height: 85 },
    { label: 'Sep', value: '25k€', height: 97 }
  ]);

  openActivityModal(): void {
    this.activityPage.set(1);
    this.showActivityModal.set(true);
  }
  closeActivityModal(): void {
    this.showActivityModal.set(false);
  }
  activityPrev(): void {
    if (this.activityPage() > 1) this.activityPage.update(p => p - 1);
  }
  activityNext(): void {
    if (this.activityPage() < this.totalActivityPages()) this.activityPage.update(p => p + 1);
  }
}
