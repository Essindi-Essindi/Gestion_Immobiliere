import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReponseSignalementRequest, SignalementResponse, StatutSignalement } from '../models/signalement.model';

@Injectable({ providedIn: 'root' })
export class SignalementService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/signalements`;

  getAll(status?: StatutSignalement): Observable<SignalementResponse[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<SignalementResponse[]>(this.api, { params });
  }

  getById(id: string): Observable<SignalementResponse> {
    return this.http.get<SignalementResponse>(`${this.api}/${id}`);
  }

  process(id: string, data: ReponseSignalementRequest = {}): Observable<SignalementResponse> {
    return this.http.post<SignalementResponse>(`${this.api}/${id}/processing`, data);
  }

  close(id: string, data: ReponseSignalementRequest = {}): Observable<SignalementResponse> {
    return this.http.post<SignalementResponse>(`${this.api}/${id}/closure`, data);
  }
}
