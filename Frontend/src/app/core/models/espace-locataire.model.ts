import { NotificationResponse } from './notification.model';

export interface ContratResume {
  id: string;
  logement_address: string;
  loyer: number;
  start_date: string;
  end_date?: string;
}

export interface DashboardLocataireResponse {
  logement_type?: string;
  logement_address?: string;
  loyer?: number;
  dernier_paiement?: string;
  prochaine_echeance?: string;
  prochaine_echeance_date?: string;
  contrat?: ContratResume;
  signalements_ouverts: number;
  notifications_non_lues: number;
  dernieres_notifications: NotificationResponse[];
}

// ni email ni mot de passe ni logement : circuits separes / no email, password or home: separate flows
export interface ProfilLocataireRequest {
  last_name: string;
  first_name: string;
  phone?: string;
  birth_date?: string;
}

// vue locataire d'un loyer, sans rien de la gestion interne du bailleur
export interface PaiementResponse {
  id: string;
  period: string;
  year: number;
  month: number;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: string;
  reminder_received: boolean;
  reminder_sent_at?: string;
  quittance_id?: string;
  logement_address: string;
}

export interface PaiementsResponse {
  items: PaiementResponse[];
  total_paye: number;
  total_en_attente: number;
  total_en_retard: number;
}

export interface QuittanceLocataireResponse {
  id: string;
  period: string;
  year: number;
  month: number;
  amount: number;
  issue_date: string;
  logement_address: string;
}
