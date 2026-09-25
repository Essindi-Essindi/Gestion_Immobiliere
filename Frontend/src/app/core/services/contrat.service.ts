import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContratRequest, ContratResponse } from '../models/contrat.model';
import { DocumentResponse } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class ContratService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/contrats`;

  create(data: ContratRequest): Observable<ContratResponse> {
    return this.http.post<ContratResponse>(this.api, data);
  }

  getAll(actif?: boolean): Observable<ContratResponse[]> {
    let params = new HttpParams();
    if (actif !== undefined) params = params.set('actif', String(actif));
    return this.http.get<ContratResponse[]>(this.api, { params });
  }

  getById(id: string): Observable<ContratResponse> {
    return this.http.get<ContratResponse>(`${this.api}/${id}`);
  }

  terminate(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/${id}/termination`, {});
  }

  pdf(id: string): Observable<Blob> {
    return this.http.get(`${this.api}/${id}/pdf`, { responseType: 'blob' });
  }

  document(id: string): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(`${this.api}/${id}/document`);
  }

  insert(id: string, file: File): Observable<DocumentResponse> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<DocumentResponse>(`${this.api}/${id}/insertion`, body);
  }

  inserted(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/inserted`);
  }

  resend(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/${id}/sending`, {});
  }
}
