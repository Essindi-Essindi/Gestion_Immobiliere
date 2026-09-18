import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

interface Reply {
  author: string;
  date: string;
  text: string;
}

interface Ticket {
  id: string;
  sujet: string;
  utilisateur: string;
  role: string;
  statut: string;
  priorite: string;
  date: string;
  message: string;
  expanded: boolean;
  replies: Reply[];
  replyDraft: string;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Support & Réclamations</h1>
          <p>Tickets de support et réclamations utilisateurs</p>
        </div>
        <div class="header-stats">
          <span class="stat-pill">{{ openCount() }} ouverts</span>
          <span class="stat-pill dark">{{ inProgressCount() }} en cours</span>
        </div>
      </div>

      <div class="card">
        <div class="card-toolbar">
          <div class="filters">
            <button [class.active]="statusFilter() === 'Tous'" (click)="setStatusFilter('Tous')">Tous</button>
            <button [class.active]="statusFilter() === 'Ouvert'" (click)="setStatusFilter('Ouvert')">Ouvert</button>
            <button [class.active]="statusFilter() === 'En cours'" (click)="setStatusFilter('En cours')">En cours</button>
            <button [class.active]="statusFilter() === 'Résolu'" (click)="setStatusFilter('Résolu')">Résolu</button>
            <button [class.active]="statusFilter() === 'Fermé'" (click)="setStatusFilter('Fermé')">Fermé</button>
          </div>
        </div>

        <div class="tickets-list">
          @for (ticket of filtered(); track ticket.id) {
            <div class="ticket" [class.expanded]="ticket.expanded">
              <div class="ticket-row" (click)="toggleTicket(ticket)">
                <div class="ticket-id">{{ ticket.id }}</div>
                <div class="ticket-info">
                  <span class="ticket-sujet">{{ ticket.sujet }}</span>
                  <span class="ticket-user">{{ ticket.utilisateur }} · {{ ticket.role }}</span>
                </div>
                <div class="ticket-meta">
                  <span class="status-badge" [class]="'s-' + ticket.statut.toLowerCase().replace(' ', '')">{{ ticket.statut }}</span>
                  <span class="ticket-date">{{ ticket.date }}</span>
                </div>
                <div class="ticket-expand">
                  <svg [class.rotated]="ticket.expanded" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              @if (ticket.expanded) {
                <div class="ticket-details">
                  <div class="ticket-message">
                    <p class="msg-label">Message :</p>
                    <p class="msg-content">{{ ticket.message }}</p>
                  </div>
                  @if (ticket.replies.length > 0) {
                    <div class="replies">
                      <p class="msg-label">Réponses ({{ ticket.replies.length }}) :</p>
                      @for (reply of ticket.replies; track reply.date + reply.text) {
                        <div class="reply">
                          <div class="reply-head">
                            <span class="reply-author">{{ reply.author }}</span>
                            <span class="reply-date">{{ reply.date }}</span>
                          </div>
                          <p class="reply-text">{{ reply.text }}</p>
                        </div>
                      }
                    </div>
                  }
                  <div class="reply-box">
                    <p class="msg-label">Écrire une réponse :</p>
                    <textarea [(ngModel)]="ticket.replyDraft" rows="3" placeholder="Tapez votre réponse ici..."></textarea>
                    <div class="ticket-actions">
                      <button class="btn-black" (click)="sendReply(ticket)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        Envoyer la réponse
                      </button>
                      <button class="btn-outline" (click)="cycleStatus(ticket); $event.stopPropagation()">
                        @if (ticket.statut === 'Ouvert') {
                          Prendre en charge
                        } @else if (ticket.statut === 'En cours') {
                          Marquer résolu
                        } @else {
                          Réouvrir
                        }
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
          @if (filtered().length === 0) {
            <div class="empty">
              <p>Aucun ticket trouvé</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; background: #f5f5f5; min-height: 100vh; }
    .page-header { margin-bottom: 24px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
    .page-header h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #000; font-family: inherit; }
    .page-header p { margin: 0; font-size: 14px; color: #666; font-family: inherit; }
    .header-stats { display: flex; gap: 8px; }
    .stat-pill { padding: 6px 14px; font-size: 12px; font-weight: 600; background: #fff; border: 1px solid #e0e0e0; color: #000; }
    .stat-pill.dark { background: #000; color: #fff; border-color: #000; }
    .card { background: #fff; border: 1px solid #e0e0e0; }
    .card-toolbar { padding: 16px 20px; border-bottom: 1px solid #e0e0e0; }
    .filters { display: flex; gap: 0; }
    .filters button { padding: 8px 16px; font-size: 13px; border: 1px solid #e0e0e0; background: #fff; color: #666; cursor: pointer; font-family: inherit; margin-left: -1px; }
    .filters button:first-child { margin-left: 0; }
    .filters button.active { background: #000; color: #fff; border-color: #000; z-index: 1; }
    .tickets-list { display: flex; flex-direction: column; }
    .ticket { border-bottom: 1px solid #f0f0f0; }
    .ticket:last-child { border-bottom: none; }
    .ticket-row { display: flex; align-items: center; gap: 16px; padding: 16px 20px; cursor: pointer; }
    .ticket-row:hover { background: #fafafa; }
    .ticket-id { font-family: monospace; font-size: 12px; color: #999; width: 80px; flex-shrink: 0; }
    .ticket-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .ticket-sujet { font-size: 14px; font-weight: 600; color: #000; }
    .ticket-user { font-size: 12px; color: #999; }
    .ticket-meta { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .status-badge { padding: 2px 10px; font-size: 11px; font-weight: 600; }
    .s-ouvert { background: #000; color: #fff; }
    .s-encours { background: #888; color: #fff; }
    .s-résolu { background: #f0f0f0; color: #000; }
    .s-fermé { background: #e0e0e0; color: #666; }
    .ticket-date { font-size: 12px; color: #999; white-space: nowrap; }
    .ticket-expand { color: #999; }
    .ticket-expand svg { transition: transform 0.2s; }
    .ticket-expand svg.rotated { transform: rotate(180deg); }
    .ticket-details { padding: 0 20px 20px 116px; }
    .ticket-message { padding: 16px; background: #fafafa; border: 1px solid #f0f0f0; margin-bottom: 16px; }
    .msg-label { margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #666; }
    .msg-content { margin: 0; font-size: 13px; color: #000; line-height: 1.6; }
    .replies { margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; }
    .reply { border: 1px solid #e0e0e0; border-left: 3px solid #000; padding: 10px 14px; }
    .reply-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .reply-author { font-size: 12px; font-weight: 700; color: #000; }
    .reply-date { font-size: 11px; color: #999; }
    .reply-text { margin: 0; font-size: 13px; color: #000; line-height: 1.5; }
    .reply-box textarea { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #e0e0e0; font-size: 13px; font-family: inherit; outline: none; resize: vertical; margin-bottom: 12px; }
    .reply-box textarea:focus { border-color: #000; }
    .ticket-actions { display: flex; gap: 8px; }
    .btn-black { display: flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 13px; font-weight: 600; border: 1px solid #000; background: #000; color: #fff; cursor: pointer; font-family: inherit; }
    .btn-black:hover { background: #222; }
    .btn-outline { padding: 8px 16px; font-size: 13px; font-weight: 500; border: 1px solid #e0e0e0; background: #fff; color: #000; cursor: pointer; font-family: inherit; }
    .btn-outline:hover { background: #f5f5f5; }
    .empty { padding: 40px 20px; text-align: center; }
    .empty p { margin: 0; font-size: 14px; color: #999; }
    @media (max-width: 768px) { .ticket-meta { flex-wrap: wrap; gap: 6px; } .ticket-details { padding-left: 20px; } }
  `]
})
export class SupportComponent {
  statusFilter = signal('Tous');

  openCount = computed(() => this.tickets().filter(t => t.statut === 'Ouvert').length);
  inProgressCount = computed(() => this.tickets().filter(t => t.statut === 'En cours').length);

  constructor(private toast: ToastService) {
    this.filterList();
  }

  tickets = signal<Ticket[]>([
    {
      id: '#SUP-042',
      sujet: 'Problème de paiement quittance',
      utilisateur: 'Ahmadou Bello',
      role: 'Locataire',
      statut: 'Ouvert',
      priorite: 'Haute',
      date: '17/09/2026',
      message: 'Je n\'arrive pas à télécharger ma quittance de loyer du mois de septembre. La page affiche une erreur 500 lorsque je clique sur "Télécharger". Cela fait 3 jours que j\'essaie.',
      expanded: false,
      replies: [],
      replyDraft: ''
    },
    {
      id: '#SUP-041',
      sujet: 'Demande de remboursement',
      utilisateur: 'Paul Mbarga',
      role: 'Bailleur',
      statut: 'En cours',
      priorite: 'Moyenne',
      date: '16/09/2026',
      message: 'Je souhaite un remboursement pour le mois d\'août car mon abonnement a été suspendu alors que j\'avais payé. Réf: PAY-2026-0892.',
      expanded: false,
      replies: [],
      replyDraft: ''
    },
    {
      id: '#SUP-040',
      sujet: 'Impossible d\'ajouter un logement',
      utilisateur: 'Sophie Kamga',
      role: 'Bailleur',
      statut: 'Ouvert',
      priorite: 'Critique',
      date: '16/09/2026',
      message: 'Depuis la mise à jour, je ne peux plus ajouter de nouveaux logements. Le bouton "Enregistrer" ne répond plus. J\'ai 12 logements à créer en urgence.',
      expanded: false,
      replies: [],
      replyDraft: ''
    },
    {
      id: '#SUP-039',
      sujet: 'Facture erronée',
      utilisateur: 'Marie Ndjock',
      role: 'Bailleur',
      statut: 'Résolu',
      priorite: 'Moyenne',
      date: '15/09/2026',
      message: 'Ma facture du mois d\'août affiche un montant de 49,99€ alors que je suis sur le plan Premium à 49,99€. Le problème était une erreur d\'affichage.',
      expanded: false,
      replies: [],
      replyDraft: ''
    },
    {
      id: '#SUP-038',
      sujet: 'Question sur les fonctionnalités Enterprise',
      utilisateur: 'Claire Fotsing',
      role: 'Bailleur',
      statut: 'Fermé',
      priorite: 'Basse',
      date: '14/09/2026',
      message: 'Je souhaite savoir quelles sont les différences entre le plan Premium et Enterprise. Merci de me faire un comparatif détaillé.',
      expanded: false,
      replies: [],
      replyDraft: ''
    },
    {
      id: '#SUP-037',
      sujet: 'Compte locataire non actif',
      utilisateur: 'Ibrahim Moussa',
      role: 'Locataire',
      statut: 'En cours',
      priorite: 'Haute',
      date: '13/09/2026',
      message: 'Mon compte locataire est marqué comme inactif alors que mon bail est toujours en cours jusqu\'en décembre 2026. Merci de vérifier.',
      expanded: false,
      replies: [],
      replyDraft: ''
    }
  ]);

  filtered = signal<Ticket[]>([]);

  filterList(): void {
    const status = this.statusFilter();
    this.filtered.set(
      this.tickets().filter(t => status === 'Tous' || t.statut === status)
    );
  }

  setStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.filterList();
  }

  toggleTicket(ticket: Ticket): void {
    this.tickets.update(list =>
      list.map(t => t.id === ticket.id ? { ...t, expanded: !t.expanded } : t)
    );
    this.filterList();
  }

  sendReply(ticket: Ticket): void {
    const text = (ticket.replyDraft || '').trim();
    if (!text) {
      this.toast.warning('Attention', 'Écrivez votre réponse avant de l\'envoyer');
      return;
    }
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    this.tickets.update(list =>
      list.map(t => t.id === ticket.id ? {
        ...t,
        replyDraft: '',
        statut: t.statut === 'Ouvert' ? 'En cours' : t.statut,
        replies: [...t.replies, { author: 'Super Admin', date: today, text }]
      } : t)
    );
    this.filterList();
    this.toast.success('Réponse envoyée', `Votre réponse a été envoyée à ${ticket.utilisateur}`);
  }

  cycleStatus(ticket: Ticket): void {
    const next = ticket.statut === 'Ouvert' ? 'En cours' : ticket.statut === 'En cours' ? 'Résolu' : 'Ouvert';
    this.tickets.update(list =>
      list.map(t => t.id === ticket.id ? { ...t, statut: next } : t)
    );
    this.filterList();
    this.toast.success('Statut mis à jour', `Ticket ${ticket.id} : ${next}`);
  }
}
