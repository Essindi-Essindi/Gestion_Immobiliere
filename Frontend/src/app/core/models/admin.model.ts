import { LogementResponse } from './logement.model';

export interface AdminRequest {
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  access_level: string;
}

export interface AdminResponse {
  id: string;
  last_name: string;
  first_name: string;
  email: string;
  access_level: string;
  created_at: string;
  updated_at: string;
}

export interface AdminBailleurResponse {
  id: string;
  name: string;
  last_name: string;
  first_name: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'ACTIF' | 'SUSPENDU';
  suspension_reason?: string;
  plan?: string;
  subscription_status?: string;
  logements: number;
  locataires: number;
  registered_at: string;
  properties: LogementResponse[];
}

export interface AdminLocataireResponse {
  id: string;
  name: string;
  last_name: string;
  first_name: string;
  email: string;
  phone?: string;
  logement_id?: string;
  logement_address?: string;
  piece_numero?: string;
  contrat?: string;
  status: 'ACTIF' | 'INVITE' | 'SUSPENDU';
  suspension_reason?: string;
  bailleur_id?: string;
  bailleur_name?: string;
  registered_at: string;
}

export interface SuspensionRequest {
  reason?: string;
}

// max_logements absent = illimite ; period_months : 1 = mensuel, 12 = annuel
export interface PlanRequest {
  name: string;
  price: number;
  period_months: number;
  features?: string[];
  max_logements?: number;
  highlighted?: boolean;
}

export interface PlanResponse {
  id: string;
  name: string;
  price: number;
  period_months: number;
  features: string[];
  max_logements?: number;
  highlighted: boolean;
  suspended: boolean;
  subscribers: number;
}

export interface AbonnementRequest {
  bailleur_id: string;
  plan_id: string;
}

export interface AbonnementResponse {
  id: string;
  bailleur_id: string;
  bailleur_name: string;
  bailleur_email: string;
  plan_id: string;
  plan_name: string;
  price: number;
  period_months: number;
  status: 'ACTIF' | 'SUSPENDU' | 'RESILIE';
  start_date: string;
  next_billing_date: string;
  ended_on?: string;
}

export interface ChangementPlanRequest {
  plan_id: string;
}

// facture SIMULEE : aucun vrai paiement / SIMULATED invoice: no real payment
export interface FactureResponse {
  id: string;
  reference?: string;
  abonnement_id: string;
  bailleur_id: string;
  bailleur_name: string;
  plan_name: string;
  period: string;
  amount: number;
  status: 'PAYEE' | 'EN_ATTENTE' | 'ECHEC';
  issued_on: string;
  paid_on?: string;
}

export interface StatutFactureRequest {
  status: 'PAYEE' | 'EN_ATTENTE' | 'ECHEC';
}

export interface SimulationFacturationResponse {
  date: string;
  abonnements_factures: number;
  factures_payees: number;
  factures_en_echec: number;
  montant_encaisse: number;
  factures: FactureResponse[];
}

export interface ParametresRequest {
  platform_name: string;
  support_email: string;
  currency: string;
  timezone: string;
  maintenance_mode: boolean;
  email_notifications: boolean;
  open_registration: boolean;
  max_logements_basic: number;
  max_logements_premium: number;
  max_upload_size_mb: number;
  session_duration_minutes: number;
}

export interface ParametresResponse extends ParametresRequest {
  updated_at: string;
}

// type : LOGIN, CREATE, UPDATE ou DELETE ; action : code precis (LOGIN_ECHEC, COMPTE_SUSPENDU...)
export interface JournalResponse {
  id: string;
  date: string;
  user?: string;
  actor_role: string;
  actor_id?: string;
  type: string;
  action: string;
  details: string;
  target_type?: string;
  target_id?: string;
  ip?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}
