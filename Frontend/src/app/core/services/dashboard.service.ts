import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardResponse } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/dashboard`;

  bailleur(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.api}/bailleur`);
  }
}
