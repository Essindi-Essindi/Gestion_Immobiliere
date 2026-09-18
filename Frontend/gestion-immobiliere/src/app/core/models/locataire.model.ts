export interface Locataire {
  id: string;
  userId?: string;
  proprietaireId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  nationalId?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  guarantor?: Guarantor;
  paymentHistory: Paiement[];
  documents: Document[];
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

export interface EmergencyContact {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  relationship: string;
}

export interface Guarantor {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  income: number;
  documents: Document[];
}

export type PaiementStatus = 'PAYE' | 'EN_RETARD' | 'PARTIEL' | 'EN_ATTENTE' | 'ANNULE';

export interface Paiement {
  id: string;
  contratId: string;
  locataireId: string;
  amount: number;
  type: PaiementType;
  status: PaiementStatus;
  dueDate: Date;
  paidAt?: Date;
  method?: PaiementMethod;
  reference?: string;
  receiptUrl?: string;
  notes?: string;
}

export type PaiementType = 'LOYER' | 'CHARGES' | 'DEPOT_GARANTIE' | 'PENALITE' | 'AUTRE';
export type PaiementMethod = 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'CARTE' | 'PRELEVEMENT' | 'AUTRE';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: Date;
  expiresAt?: Date;
}

export type DocumentType = 'BAIL' | 'ETAT_LIEUX_ENTREE' | 'ETAT_LIEUX_SORTIE' | 'ASSURANCE' | 'DIAGNOSTIC' | 'QUITTANCE' | 'AVIS_IMPOSITION' | 'CONTRAT_TRAVAIL' | 'PIECE_IDENTITE' | 'AUTRE';