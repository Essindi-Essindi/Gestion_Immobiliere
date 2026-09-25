export type StatutSignalement = 'NOUVEAU' | 'EN_COURS' | 'TERMINE';
export type PrioriteSignalement = 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';

export interface SignalementResponse {
  id: string;
  title?: string;
  description: string;
  category: string;
  priority: PrioriteSignalement;
  photo?: string;
  status: StatutSignalement;
  response?: string;
  creation_date: string;
  locataire_id: string;
  locataire_name: string;
  logement_id: string;
  logement_address: string;
  created_at: string;
  updated_at: string;
}

// utilise par /api/locataire/signalements : logement/locataire viennent du jeton + contrat en cours
// used by /api/locataire/signalements: home/tenant come from the token + ongoing contract
export interface NouveauSignalementRequest {
  title: string;
  description: string;
  category: string;
  priority?: PrioriteSignalement;
  photo?: string;
}

// utilise par /api/locataires/{id}/reports : logement_id explicite
// used by /api/locataires/{id}/reports: explicit logement_id
export interface SignalementRequest {
  title?: string;
  description: string;
  category: string;
  priority: PrioriteSignalement;
  photo?: string;
  logement_id: string;
}

export interface ReponseSignalementRequest {
  response?: string;
}
