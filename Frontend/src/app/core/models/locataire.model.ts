// password absent = invitation par lien, present = mot de passe temporaire
// password absent = invitation link, present = temporary password
export interface LocataireRequest {
  last_name: string;
  first_name: string;
  email: string;
  password?: string;
  phone?: string;
  birth_date?: string;
  logement_id?: string;
  piece_id?: string;
}

export interface LocataireResponse {
  id: string;
  last_name: string;
  first_name: string;
  email: string;
  phone: string;
  birth_date: string;
  logement_id?: string;
  logement_address?: string;
  piece_id?: string;
  piece_numero?: string;
  piece_type?: string;
  activated: boolean;
  created_at: string;
  updated_at: string;
}
