import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuittanceRequest, QuittanceResponse } from '../models/quittance.model';
import { DocumentResponse } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class QuittanceService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/quittances`;

  create(data: QuittanceRequest): Observable<QuittanceResponse> {
    return this.http.post<QuittanceResponse>(this.api, data);
  }

  getAll(): Observable<QuittanceResponse[]> {
    return this.http.get<QuittanceResponse[]>(this.api);
  }

  getById(id: string): Observable<QuittanceResponse> {
    return this.http.get<QuittanceResponse>(`${this.api}/${id}`);
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
