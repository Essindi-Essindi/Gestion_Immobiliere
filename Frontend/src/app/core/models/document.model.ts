export type StatutEnvoiDocument = 'EN_ATTENTE' | 'ENVOYE' | 'PARTIEL' | 'ECHEC' | 'NON_ENVOYE';

export interface DocumentResponse {
  id: string;
  type: 'CONTRAT' | 'QUITTANCE';
  ref_id: string;
  file_name: string;
  size_bytes: number;
  generated_at: string;
  email_status: StatutEnvoiDocument;
  sent_to_bailleur: boolean;
  sent_to_locataire: boolean;
  attempts: number;
  last_error?: string;
  sent_at?: string;
}
