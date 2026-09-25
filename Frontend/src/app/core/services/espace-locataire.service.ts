import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DashboardLocataireResponse,
  PaiementsResponse,
  ProfilLocataireRequest,
  QuittanceLocataireResponse
} from '../models/espace-locataire.model';
import { LocataireResponse } from '../models/locataire.model';
import { LogementResponse } from '../models/logement.model';
import { ContratResponse } from '../models/contrat.model';
import { NouveauSignalementRequest, SignalementResponse, StatutSignalement } from '../models/signalement.model';

@Injectable({ providedIn: 'root' })
export class EspaceLocataireService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/locataire`;

  dashboard(): Observable<DashboardLocataireResponse> {
    return this.http.get<DashboardLocataireResponse>(`${this.api}/dashboard`);
  }

  profile(): Observable<LocataireResponse> {
    return this.http.get<LocataireResponse>(`${this.api}/profile`);
  }

  updateProfile(data: ProfilLocataireRequest): Observable<LocataireResponse> {
    return this.http.put<LocataireResponse>(`${this.api}/profile`, data);
  }

  logement(): Observable<LogementResponse> {
    return this.http.get<LogementResponse>(`${this.api}/logement`);
  }

  contrat(): Observable<ContratResponse> {
    return this.http.get<ContratResponse>(`${this.api}/contrat`);
  }

  demanderResiliation(): Observable<ContratResponse> {
    return this.http.post<ContratResponse>(`${this.api}/contrat/resiliation`, {});
  }

  paiements(year?: number, status?: string): Observable<PaiementsResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    if (status) params = params.set('status', status);
    return this.http.get<PaiementsResponse>(`${this.api}/paiements`, { params });
  }

  quittances(year?: number): Observable<QuittanceLocataireResponse[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.get<QuittanceLocataireResponse[]>(`${this.api}/quittances`, { params });
  }

  signalements(status?: StatutSignalement): Observable<SignalementResponse[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<SignalementResponse[]>(`${this.api}/signalements`, { params });
  }

  signalement(id: string): Observable<SignalementResponse> {
    return this.http.get<SignalementResponse>(`${this.api}/signalements/${id}`);
  }

  newSignalement(data: NouveauSignalementRequest): Observable<SignalementResponse> {
    return this.http.post<SignalementResponse>(`${this.api}/signalements`, data);
  }
}
