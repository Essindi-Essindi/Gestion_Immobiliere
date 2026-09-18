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
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss'
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
