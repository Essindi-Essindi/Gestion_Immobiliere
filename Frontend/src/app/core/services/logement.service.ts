import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LogementRequest, LogementResponse } from '../models/logement.model';

@Injectable({ providedIn: 'root' })
export class LogementService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/logements`;

  create(data: LogementRequest): Observable<LogementResponse> {
    return this.http.post<LogementResponse>(this.api, data);
  }

  getAll(): Observable<LogementResponse[]> {
    return this.http.get<LogementResponse[]>(this.api);
  }

  getById(id: string): Observable<LogementResponse> {
    return this.http.get<LogementResponse>(`${this.api}/${id}`);
  }

  update(id: string, data: LogementRequest): Observable<LogementResponse> {
    return this.http.put<LogementResponse>(`${this.api}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // chambre d'un locataire / tenant room
  assign(id: string, locataire_id: string, piece_id: string): Observable<LogementResponse> {
    return this.http.post<LogementResponse>(`${this.api}/${id}/assignations`, { locataire_id, piece_id });
  }

  release(id: string, locataire_id: string): Observable<LogementResponse> {
    return this.http.delete<LogementResponse>(`${this.api}/${id}/occupants/${locataire_id}`);
  }
}
