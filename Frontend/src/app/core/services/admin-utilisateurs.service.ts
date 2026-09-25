import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminBailleurResponse, AdminLocataireResponse, SuspensionRequest } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminUtilisateursService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/admin`;

  bailleurs(status?: string, q?: string): Observable<AdminBailleurResponse[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (q) params = params.set('q', q);
    return this.http.get<AdminBailleurResponse[]>(`${this.api}/bailleurs`, { params });
  }

  bailleur(id: string): Observable<AdminBailleurResponse> {
    return this.http.get<AdminBailleurResponse>(`${this.api}/bailleurs/${id}`);
  }

  suspendBailleur(id: string, data: SuspensionRequest = {}): Observable<void> {
    return this.http.post<void>(`${this.api}/bailleurs/${id}/suspension`, data);
  }

  activateBailleur(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/bailleurs/${id}/activation`, {});
  }

  locataires(status?: string, q?: string): Observable<AdminLocataireResponse[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (q) params = params.set('q', q);
    return this.http.get<AdminLocataireResponse[]>(`${this.api}/locataires`, { params });
  }

  locataire(id: string): Observable<AdminLocataireResponse> {
    return this.http.get<AdminLocataireResponse>(`${this.api}/locataires/${id}`);
  }

  suspendLocataire(id: string, data: SuspensionRequest = {}): Observable<void> {
    return this.http.post<void>(`${this.api}/locataires/${id}/suspension`, data);
  }

  activateLocataire(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/locataires/${id}/activation`, {});
  }
}
