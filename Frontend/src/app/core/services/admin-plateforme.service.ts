import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminDashboardResponse } from '../models/dashboard.model';
import { JournalResponse, PageResponse, ParametresRequest, ParametresResponse } from '../models/admin.model';

export interface JournalFiltre {
  type?: string;
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminPlateformeService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/admin`;

  dashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.api}/dashboard`);
  }

  parametres(): Observable<ParametresResponse> {
    return this.http.get<ParametresResponse>(`${this.api}/parametres`);
  }

  updateParametres(data: ParametresRequest): Observable<ParametresResponse> {
    return this.http.put<ParametresResponse>(`${this.api}/parametres`, data);
  }

  resetParametres(): Observable<ParametresResponse> {
    return this.http.post<ParametresResponse>(`${this.api}/parametres/reset`, {});
  }

  journal(filtre: JournalFiltre = {}): Observable<PageResponse<JournalResponse>> {
    let params = new HttpParams();
    Object.entries(filtre).forEach(([key, value]) => {
      if (value !== undefined) params = params.set(key, String(value));
    });
    return this.http.get<PageResponse<JournalResponse>>(`${this.api}/journal`, { params });
  }
}
