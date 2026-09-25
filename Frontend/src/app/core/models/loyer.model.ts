export type StatutLoyer = 'PAYE' | 'EN_ATTENTE' | 'EN_RETARD';

export interface LoyerResponse {
  id: string;
  contrat_id: string;
  logement_id: string;
  logement_address: string;
  locataire_id: string;
  locataire_name: string;
  piece_numero?: string;
  period: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: StatutLoyer;
  reminder_sent_at?: string;
}

// impayes regroupes par locataire / overdue rents grouped by tenant
export interface ArrieresResponse {
  locataire_id: string;
  locataire_name: string;
  logement_address: string;
  periods: string[];
  nb_mois: number;
  total_du: number;
  plus_ancienne_echeance: string;
}

export interface StatutLoyerRequest {
  status: StatutLoyer;
  paid_date?: string;
}
