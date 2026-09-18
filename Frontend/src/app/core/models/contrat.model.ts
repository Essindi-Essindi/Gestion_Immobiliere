export type ContratStatus = 'ACTIF' | 'EXPIRE' | 'RESILIE' | 'EN_COURS' | 'SIGNE' | 'BROUILLON';

export interface Contrat {
  id: string;
  logementId: string;
  locataireId: string;
  proprietaireId: string;
  status: ContratStatus;
  startDate: Date;
  endDate: Date;
  rent: number;
  charges: number;
  deposit: number;
  rentRevisionIndex?: string;
  rentRevisionDate?: Date;
  noticePeriod: number;
  specialClauses?: string;
  documents: Document[];
  generatedPdfUrl?: string;
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: Date;
}

export type DocumentType = 'BAIL' | 'ETAT_LIEUX_ENTREE' | 'ETAT_LIEUX_SORTIE' | 'ASSURANCE' | 'DIAGNOSTIC' | 'QUITTANCE' | 'AUTRE';

export interface ContratFormData {
  logementId: string;
  locataireId: string;
  startDate: Date;
  endDate: Date;
  rent: number;
  charges: number;
  deposit: number;
  rentRevisionIndex?: string;
  noticePeriod: number;
  specialClauses?: string;
}