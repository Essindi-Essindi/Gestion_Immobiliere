import { Locataire } from './locataire.model';
import { Contrat } from './contrat.model';

export type LogementType = 'APPARTEMENT' | 'MAISON' | 'STUDIO' | 'LOFT' | 'COMMERCIAL' | 'PARKING' | 'CAVE' | 'AUTRE';
export type LogementStatus = 'LOUE' | 'VACANT' | 'EN_TRAVAUX' | 'RESERVE';

export interface Logement {
  id: string;
  proprietaireId: string;
  address: Address;
  type: LogementType;
  status: LogementStatus;
  surface: number;
  rooms: number;
  floor?: string;
  rent: number;
  charges: number;
  deposit: number;
  description?: string;
  photos: Photo[];
  diagnostics: Diagnostic[];
  currentTenant?: Locataire;
  currentContract?: Contrat;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  complement?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  isMain: boolean;
  uploadedAt: Date;
}

export interface Diagnostic {
  id: string;
  type: DiagnosticType;
  status: 'VALID' | 'EXPIRED' | 'PENDING';
  documentUrl?: string;
  performedAt: Date;
  expiresAt?: Date;
}

export type DiagnosticType = 'DPE' | 'ERP' | 'LEAD' | 'ASBESTOS' | 'GAS' | 'ELECTRICITY' | 'TERMITES' | 'NOISE';