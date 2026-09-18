import { Notification } from './notification.model';

export interface SuperAdminDashboardStats {
  totalProprietaires: number;
  totalLocataires: number;
  totalLogements: number;
  totalRevenue: number;
  growth: GrowthData[];
  recentActivity: Activity[];
  alerts: Alert[];
}

export interface ProprietaireDashboardStats {
  loyersEncaisses: number;
  loyersEnAttente: number;
  tauxOccupation: number;
  alerts: ProprietaireAlert[];
  revenueChart: ChartData[];
  occupancyChart: ChartData[];
}

export interface LocataireDashboardStats {
  loyerDuMois: number;
  statutPaiement: 'A_JOUR' | 'EN_RETARD' | 'PARTIEL';
  nextPaymentDate: Date;
  recentNotifications: Notification[];
  currentContract?: ContratSummary;
}

export interface GrowthData {
  period: string;
  proprietaires: number;
  locataires: number;
  logements: number;
  revenue: number;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: Date;
  details?: string;
}

export interface Alert {
  id: string;
  type: 'WARNING' | 'ERROR' | 'INFO';
  message: string;
  entityType?: string;
  entityId?: string;
  createdAt: Date;
}

export interface ProprietaireAlert {
  id: string;
  type: 'RETARD_LOYER' | 'CONTRAT_EXPIRE' | 'DEPOT_RESTITUER' | 'REVISION_LOYER' | 'INTERVENTION_URGENTE';
  message: string;
  logementId?: string;
  locataireId?: string;
  contratId?: string;
  dueDate?: Date;
  createdAt: Date;
}

export interface ChartData {
  label: string;
  value: number;
}

export interface ContratSummary {
  id: string;
  startDate: Date;
  endDate: Date;
  rent: number;
  charges: number;
  logementAddress: string;
}