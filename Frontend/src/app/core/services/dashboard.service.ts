import { Injectable } from '@angular/core';
import { ApiService } from '@core/http/api.service';
import { Observable } from 'rxjs';
import { SuperAdminDashboardStats, ProprietaireDashboardStats, LocataireDashboardStats } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private endpoint = '/dashboard';

  constructor(private api: ApiService) {}

  getSuperAdminStats(): Observable<SuperAdminDashboardStats> {
    return this.api.get<SuperAdminDashboardStats>(`${this.endpoint}/super-admin`);
  }

  getProprietaireStats(proprietaireId: string): Observable<ProprietaireDashboardStats> {
    return this.api.get<ProprietaireDashboardStats>(`${this.endpoint}/proprietaire`, { proprietaireId });
  }

  getLocataireStats(locataireId: string): Observable<LocataireDashboardStats> {
    return this.api.get<LocataireDashboardStats>(`${this.endpoint}/locataire`, { locataireId });
  }
}