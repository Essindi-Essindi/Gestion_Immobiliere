import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AbonnementRequest,
  AbonnementResponse,
  ChangementPlanRequest,
  FactureResponse,
  PlanRequest,
  PlanResponse,
  SimulationFacturationResponse,
  StatutFactureRequest
} from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminAbonnementsService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/admin`;

  plans(): Observable<PlanResponse[]> {
    return this.http.get<PlanResponse[]>(`${this.api}/plans`);
  }

  createPlan(data: PlanRequest): Observable<PlanResponse> {
    return this.http.post<PlanResponse>(`${this.api}/plans`, data);
  }

  updatePlan(id: string, data: PlanRequest): Observable<PlanResponse> {
    return this.http.put<PlanResponse>(`${this.api}/plans/${id}`, data);
  }

  suspendPlan(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/plans/${id}/suspension`, {});
  }

  activatePlan(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/plans/${id}/activation`, {});
  }

  deletePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/plans/${id}`);
  }

  abonnements(status?: string, planId?: string): Observable<AbonnementResponse[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (planId) params = params.set('plan_id', planId);
    return this.http.get<AbonnementResponse[]>(`${this.api}/abonnements`, { params });
  }

  subscribe(data: AbonnementRequest): Observable<AbonnementResponse> {
    return this.http.post<AbonnementResponse>(`${this.api}/abonnements`, data);
  }

  changePlan(id: string, data: ChangementPlanRequest): Observable<AbonnementResponse> {
    return this.http.put<AbonnementResponse>(`${this.api}/abonnements/${id}/plan`, data);
  }

  suspendAbonnement(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/abonnements/${id}/suspension`, {});
  }

  resumeAbonnement(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/abonnements/${id}/resumption`, {});
  }

  terminateAbonnement(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/abonnements/${id}/termination`, {});
  }

  factures(bailleurId?: string, status?: string): Observable<FactureResponse[]> {
    let params = new HttpParams();
    if (bailleurId) params = params.set('bailleur_id', bailleurId);
    if (status) params = params.set('status', status);
    return this.http.get<FactureResponse[]>(`${this.api}/factures`, { params });
  }

  setFactureStatus(id: string, data: StatutFactureRequest): Observable<FactureResponse> {
    return this.http.put<FactureResponse>(`${this.api}/factures/${id}/status`, data);
  }

  simulateFacturation(date: string): Observable<SimulationFacturationResponse> {
    const params = new HttpParams().set('date', date);
    return this.http.post<SimulationFacturationResponse>(`${this.api}/facturation/simulation`, {}, { params });
  }
}
