export interface PieceRequest {
  numero: string;
  type: string;
  capacite: number;
}

export interface PieceOccupant {
  locataire_id: string;
  nom: string;
}

export interface PieceResponse {
  id: string;
  numero: string;
  type: string;
  capacite: number;
  occupants: PieceOccupant[];
}

export interface LogementRequest {
  address: string;
  postal_code: string;
  city: string;
  country: string;
  type: string;
  area: number;
  rent: number;
  charges: number;
  pieces?: PieceRequest[];
}

export interface LogementResponse {
  id: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  type: string;
  area: number;
  rent: number;
  charges: number;
  status: 'LOUE' | 'VACANT';
  locataire_id?: string;
  locataire_name?: string;
  bailleur_id: string;
  pieces: PieceResponse[];
  created_at: string;
  updated_at: string;
}
