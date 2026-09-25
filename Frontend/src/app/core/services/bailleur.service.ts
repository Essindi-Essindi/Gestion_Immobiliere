import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BailleurRequest, BailleurResponse } from '../models/bailleur.model';
import { QuittanceResponse } from '../models/quittance.model';

@Injectable({ providedIn: 'root' })
export class BailleurService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/bailleurs`;

  create(data: BailleurRequest): Observable<BailleurResponse> {
    return this.http.post<BailleurResponse>(this.api, data);
  }

  getAll(): Observable<BailleurResponse[]> {
    return this.http.get<BailleurResponse[]>(this.api);
  }

  getById(id: string): Observable<BailleurResponse> {
    return this.http.get<BailleurResponse>(`${this.api}/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  receipt(contratId: string): Observable<QuittanceResponse> {
    return this.http.post<QuittanceResponse>(`${this.api}/contrats/${contratId}/receipts`, {});
  }
}
