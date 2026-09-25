export interface BailleurRequest {
  last_name: string;
  first_name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
}

export interface BailleurResponse {
  id: string;
  last_name: string;
  first_name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}
