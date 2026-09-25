export interface QuittanceRequest {
  period: string;
  amount: number;
  issue_date?: string;
  contrat_id: string;
}

export interface QuittanceResponse {
  id: string;
  period: string;
  amount: number;
  issue_date: string;
  contrat_id: string;
  created_at: string;
  updated_at: string;
}
