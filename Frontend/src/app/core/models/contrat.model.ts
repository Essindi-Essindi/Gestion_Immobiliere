// monthly_rent absent = loyer du logement / no rent = the home's rent
export interface ContratRequest {
  start_date: string;
  end_date?: string;
  monthly_rent?: number;
  deposit?: number;
  logement_id: string;
  locataire_id: string;
}

export interface ContratResponse {
  id: string;
  start_date: string;
  end_date?: string;
  monthly_rent: number;
  deposit: number;
  actif: boolean;
  resiliation_demandee: boolean;
  logement_id: string;
  logement_address: string;
  bailleur_id: string;
  locataire_id: string;
  locataire_name: string;
  created_at: string;
  updated_at: string;
}
