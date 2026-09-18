export type InterventionStatus = 'NOUVEAU' | 'EN_COURS' | 'RESOLU' | 'FERME' | 'ANNULE';
export type InterventionPriority = 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
export type InterventionCategory = 'PLOMBERIE' | 'ELECTRICITE' | 'CHAUFFAGE' | 'MENUISERIE' | 'PEINTURE' | 'SERRURERIE' | 'TOITURE' | 'PLOMBERIE' | 'AUTRE';

export interface Intervention {
  id: string;
  logementId: string;
  locataireId: string;
  proprietaireId: string;
  title: string;
  description: string;
  category: InterventionCategory;
  priority: InterventionPriority;
  status: InterventionStatus;
  photos: Photo[];
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: Date;
}

export interface InterventionFormData {
  logementId: string;
  title: string;
  description: string;
  category: InterventionCategory;
  priority: InterventionPriority;
  photos?: File[];
}