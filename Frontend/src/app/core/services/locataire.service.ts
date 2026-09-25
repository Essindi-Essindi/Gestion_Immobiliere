import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocataireRequest, LocataireResponse } from '../models/locataire.model';
import { ContratResponse } from '../models/contrat.model';
import { SignalementRequest, SignalementResponse } from '../models/signalement.model';

@Injectable({ providedIn: 'root' })
export class LocataireService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/locataires`;

  create(data: LocataireRequest): Observable<LocataireResponse> {
    return this.http.post<LocataireResponse>(this.api, data);
  }

  getAll(logementId?: string): Observable<LocataireResponse[]> {
    let params = new HttpParams();
    if (logementId) params = params.set('logement_id', logementId);
    return this.http.get<LocataireResponse[]>(this.api, { params });
  }

  getById(id: string): Observable<LocataireResponse> {
    return this.http.get<LocataireResponse>(`${this.api}/${id}`);
  }

  update(id: string, data: Partial<LocataireRequest>): Observable<LocataireResponse> {
    return this.http.put<LocataireResponse>(`${this.api}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  report(id: string, data: SignalementRequest): Observable<SignalementResponse> {
    return this.http.post<SignalementResponse>(`${this.api}/${id}/reports`, data);
  }

  contract(id: string): Observable<ContratResponse> {
    return this.http.get<ContratResponse>(`${this.api}/${id}/contract`);
  }
}
