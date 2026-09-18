import { Injectable } from '@angular/core';
import { ApiService, PaginatedResponse } from './api.service';
import { Observable } from 'rxjs';
import { Proprietaire, SubscriptionPlan, SubscriptionPlanDetails, Address, BankDetails } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProprietaireService {
  private endpoint = '/proprietaires';

  constructor(private api: ApiService) {}

  getAll(params?: {
    page?: number;
    size?: number;
    sort?: string;
    plan?: SubscriptionPlan;
    status?: string;
    search?: string;
  }): Observable<PaginatedResponse<Proprietaire>> {
    return this.api.get<PaginatedResponse<Proprietaire>>(this.endpoint, params);
  }

  getById(id: string): Observable<Proprietaire> {
    return this.api.get<Proprietaire>(`${this.endpoint}/${id}`);
  }

  create(data: Partial<Proprietaire>): Observable<Proprietaire> {
    return this.api.post<Proprietaire>(this.endpoint, data);
  }

  update(id: string, data: Partial<Proprietaire>): Observable<Proprietaire> {
    return this.api.put<Proprietaire>(`${this.endpoint}/${id}`, data);
  }

  updateStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): Observable<Proprietaire> {
    return this.api.patch<Proprietaire>(`${this.endpoint}/${id}/status`, { status });
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  updateAddress(id: string, address: Address): Observable<Proprietaire> {
    return this.api.put<Proprietaire>(`${this.endpoint}/${id}/address`, address);
  }

  updateBankDetails(id: string, bankDetails: BankDetails): Observable<Proprietaire> {
    return this.api.put<Proprietaire>(`${this.endpoint}/${id}/bank-details`, bankDetails);
  }

  changePlan(id: string, plan: SubscriptionPlan): Observable<Proprietaire> {
    return this.api.patch<Proprietaire>(`${this.endpoint}/${id}/plan`, { plan });
  }

  getPlans(): Observable<SubscriptionPlanDetails[]> {
    return this.api.get<SubscriptionPlanDetails[]>(`${this.endpoint}/plans`);
  }

  getBillingHistory(proprietaireId: string): Observable<Array<{
    id: string;
    plan: SubscriptionPlan;
    amount: number;
    status: string;
    date: Date;
    invoiceUrl?: string;
  }>> {
    return this.api.get(`${this.endpoint}/${proprietaireId}/billing`);
  }

  getStats(): Observable<{
    total: number;
    active: number;
    suspended: number;
    byPlan: Record<SubscriptionPlan, number>;
    totalRevenue: number;
  }> {
    return this.api.get(`${this.endpoint}/stats`);
  }
}