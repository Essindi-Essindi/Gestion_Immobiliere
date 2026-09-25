import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArrieresResponse, LoyerResponse, StatutLoyer } from '../models/loyer.model';
import { QuittanceResponse } from '../models/quittance.model';

export interface LoyerFiltre {
  period?: string;
  status?: StatutLoyer;
  logement_id?: string;
  locataire_id?: string;
}

@Injectable({ providedIn: 'root' })
export class LoyerService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/loyers`;

  getAll(filtre: LoyerFiltre = {}): Observable<LoyerResponse[]> {
    let params = new HttpParams();
    Object.entries(filtre).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    return this.http.get<LoyerResponse[]>(this.api, { params });
  }

  arrears(): Observable<ArrieresResponse[]> {
    return this.http.get<ArrieresResponse[]>(`${this.api}/arrears`);
  }

  getById(id: string): Observable<LoyerResponse> {
    return this.http.get<LoyerResponse>(`${this.api}/${id}`);
  }

  setStatus(id: string, status: StatutLoyer): Observable<LoyerResponse> {
    return this.http.put<LoyerResponse>(`${this.api}/${id}/status`, { status });
  }

  reminder(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/${id}/reminder`, {});
  }

  receipt(id: string): Observable<QuittanceResponse> {
    return this.http.post<QuittanceResponse>(`${this.api}/${id}/receipt`, {});
  }
}
