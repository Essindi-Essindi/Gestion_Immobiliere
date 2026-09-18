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
template: `
    <div class="page">
      <div class="page-header">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble de la plateforme</p>
      </div>

      <div class="stats-grid">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card">
            <div class="stat-icon">
              <span [innerHTML]="stat.icon"></span>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
            <div class="stat-change" [class.up]="stat.changeUp" [class.down]="!stat.changeUp">
              {{ stat.change }}
            </div>
          </div>
        }
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h2>Revenus mensuels</h2>
          </div>
          <div class="card-body">
            <div class="bar-chart">
              @for (bar of barData(); track bar.label) {
                <div class="bar-group">
                  <div class="bar-wrapper">
                    <div class="bar" [style.height.%]="bar.height"></div>
                  </div>
                  <span class="bar-label">{{ bar.label }}</span>
                  <span class="bar-value">{{ bar.value }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Activité récente</h2>
          </div>
          <div class="card-body">
            <div class="activity-list">
              @for (a of activities().slice(0, 6); track a.id) {
                <div class="activity-item">
                  <div class="activity-dot" [class]="'dot-' + a.type"></div>
                  <div class="activity-content">
                    <p class="activity-text"><strong>{{ a.user }}</strong> {{ a.action }} <span class="activity-target">{{ a.target }}</span></p>
                    <span class="activity-time">{{ a.time }}</span>
                  </div>
                </div>
              }
            </div>
            <button class="btn-more" (click)="openActivityModal()">Voir plus ({{ activities().length }})</button>
          </div>
        </div>
      </div>

      @if (showActivityModal()) {
        <div class="modal-overlay" (click)="closeActivityModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Toute l'activité ({{ activities().length }})</h2>
              <button class="modal-close" (click)="closeActivityModal()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="activity-list">
                @for (a of pagedActivities(); track a.id) {
                  <div class="activity-item">
                    <div class="activity-dot" [class]="'dot-' + a.type"></div>
                    <div class="activity-content">
                      <p class="activity-text"><strong>{{ a.user }}</strong> {{ a.action }} <span class="activity-target">{{ a.target }}</span></p>
                      <span class="activity-time">{{ a.time }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
            <div class="modal-footer pagination">
              <button class="btn-outline" [disabled]="activityPage() === 1" (click)="activityPrev()">‹ Précédent</button>
              <span class="page-info">Page {{ activityPage() }} / {{ totalActivityPages() }}</span>
              <button class="btn-black" [disabled]="activityPage() === totalActivityPages()" (click)="activityNext()">Suivant ›</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; background: #f5f5f5; min-height: 100vh; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #000; font-family: inherit; }
    .page-header p { margin: 0; font-size: 14px; color: #666; font-family: inherit; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #fff; border: 1px solid #e0e0e0; padding: 20px; display: flex; align-items: center; gap: 16px; position: relative; }
    .stat-icon { width: 48px; height: 48px; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-icon :deep(svg) { width: 24px; height: 24px; }
    .stat-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .stat-value { font-size: 28px; font-weight: 700; color: #000; line-height: 1; }
    .stat-label { font-size: 13px; color: #666; }
    .stat-change { position: absolute; top: 12px; right: 12px; font-size: 12px; font-weight: 600; padding: 2px 8px; }
    .stat-change.up { color: #000; background: #f0f0f0; }
    .stat-change.down { color: #666; background: #f0f0f0; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .card { background: #fff; border: 1px solid #e0e0e0; }
    .card-header { padding: 16px 20px; border-bottom: 1px solid #e0e0e0; }
    .card-header h2 { margin: 0; font-size: 15px; font-weight: 600; color: #000; font-family: inherit; }
    .card-body { padding: 20px; }
    .bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 200px; padding-top: 10px; }
    .bar-group { display: flex; flex-direction: column; align-items: center; flex: 1; gap: 6px; }
    .bar-wrapper { width: 100%; height: 160px; display: flex; align-items: flex-end; }
    .bar { width: 100%; background: #000; min-height: 4px; transition: height 0.3s; }
    .bar-label { font-size: 11px; color: #666; text-align: center; }
    .bar-value { font-size: 12px; font-weight: 600; color: #000; }
    .activity-list { display: flex; flex-direction: column; gap: 0; }
    .activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .activity-item:last-child { border-bottom: none; }
    .activity-dot { width: 8px; height: 8px; margin-top: 6px; flex-shrink: 0; }
    .dot-create { background: #000; }
    .dot-update { background: #888; }
    .dot-delete { background: #ccc; }
    .dot-login { background: #444; }
    .activity-content { flex: 1; }
    .activity-text { margin: 0 0 2px; font-size: 13px; color: #000; line-height: 1.4; }
    .activity-target { color: #666; }
    .activity-time { font-size: 11px; color: #999; }
    .btn-more { margin-top: 12px; width: 100%; background: #fff; color: #000; border: 1px solid #000; padding: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
    .btn-more:hover { background: #000; color: #fff; }
    .btn-black { padding: 8px 16px; font-size: 13px; font-weight: 600; border: 1px solid #000; background: #000; color: #fff; cursor: pointer; font-family: inherit; }
    .btn-black:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-outline { padding: 8px 16px; font-size: 13px; border: 1px solid #e0e0e0; background: #fff; color: #000; cursor: pointer; font-family: inherit; font-weight: 500; }
    .btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border: 1px solid #e0e0e0; width: 640px; max-width: 95vw; max-height: 85vh; display: flex; flex-direction: column; }
    .modal-header { padding: 16px 20px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; justify-content: space-between; }
    .modal-header h2 { margin: 0; font-size: 16px; font-weight: 700; color: #000; font-family: inherit; }
    .modal-close { border: none; background: none; cursor: pointer; padding: 4px; color: #666; }
    .modal-body { padding: 8px 20px; overflow-y: auto; }
    .modal-footer { padding: 16px 20px; border-top: 1px solid #e0e0e0; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 12px; }
    .page-info { font-size: 13px; color: #000; font-weight: 600; }
    @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .grid-2 { grid-template-columns: 1fr; } }
    @media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; } }
  `]
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
