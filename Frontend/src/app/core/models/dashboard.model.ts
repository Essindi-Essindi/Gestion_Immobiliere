import { JournalResponse } from './admin.model';

export interface LogementsStats {
  total: number;
  loues: number;
  vacants: number;
  taux_occupation: number;
}

export interface LocatairesStats {
  total: number;
  actifs: number;
  invites: number;
}

export interface ContratsStats {
  actifs: number;
  expirant_60_jours: number;
}

// mois courant : attendu / encaisse / reste a encaisser
export interface LoyersMoisStats {
  period: string;
  attendu: number;
  encaisse: number;
  reste: number;
  taux_recouvrement: number;
}

export interface ArrieresStats {
  nb_locataires: number;
  nb_loyers: number;
  total_du: number;
}

export interface InterventionsStats {
  nouvelles: number;
  en_cours: number;
  terminees: number;
}

export interface RevenuMoisBailleur {
  period: string;
  attendu: number;
  encaisse: number;
}

// contrats qui se terminent bientot / contracts ending soon
export interface EcheanceContrat {
  contrat_id: string;
  locataire_name: string;
  logement_address: string;
  end_date: string;
  jours_restants: number;
}

export interface DashboardResponse {
  logements: LogementsStats;
  locataires: LocatairesStats;
  contrats: ContratsStats;
  loyers_mois: LoyersMoisStats;
  arrieres: ArrieresStats;
  interventions: InterventionsStats;
  revenus_6_mois: RevenuMoisBailleur[];
  echeances: EcheanceContrat[];
}

export interface ComptesStats {
  total: number;
  actifs: number;
  suspendus: number;
  nouveaux_ce_mois: number;
  croissance_pct: number;
}

export interface AbonnementsParPlan {
  plan: string;
  abonnes: number;
}

export interface AbonnementsStats {
  actifs: number;
  suspendus: number;
  par_plan: AbonnementsParPlan[];
}

export interface RevenusStats {
  period: string;
  mois_courant: number;
  mois_precedent: number;
  croissance_pct: number;
}

export interface RevenuMoisAdmin {
  period: string;
  montant: number;
}

export interface AdminDashboardResponse {
  bailleurs: ComptesStats;
  locataires: ComptesStats;
  logements: number;
  contrats_actifs: number;
  abonnements: AbonnementsStats;
  revenus: RevenusStats;
  revenus_7_mois: RevenuMoisAdmin[];
  activite_recente: JournalResponse[];
}
