import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminRequest, AdminResponse } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/admins`;

  create(data: AdminRequest): Observable<AdminResponse> {
    return this.http.post<AdminResponse>(this.api, data);
  }

  getAll(): Observable<AdminResponse[]> {
    return this.http.get<AdminResponse[]>(this.api);
  }

  getById(id: string): Observable<AdminResponse> {
    return this.http.get<AdminResponse>(`${this.api}/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
