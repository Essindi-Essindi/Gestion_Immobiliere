import { Injectable } from '@angular/core';
import { ApiService, PaginatedResponse } from './api.service';
import { Observable } from 'rxjs';
import { Intervention, InterventionStatus, InterventionCategory, InterventionPriority, InterventionFormData } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InterventionService {
  private endpoint = '/interventions';

  constructor(private api: ApiService) {}

  getAll(params?: {
    page?: number;
    size?: number;
    sort?: string;
    status?: InterventionStatus;
    category?: InterventionCategory;
    priority?: InterventionPriority;
    proprietaireId?: string;
    locataireId?: string;
    logementId?: string;
    search?: string;
  }): Observable<PaginatedResponse<Intervention>> {
    return this.api.get<PaginatedResponse<Intervention>>(this.endpoint, params);
  }

  getById(id: string): Observable<Intervention> {
    return this.api.get<Intervention>(`${this.endpoint}/${id}`);
  }

  create(data: InterventionFormData): Observable<Intervention> {
    const formData = new FormData();
    formData.append('logementId', data.logementId);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('priority', data.priority);
    if (data.photos) {
      data.photos.forEach(photo => formData.append('photos', photo));
    }
    return this.api.upload<Intervention>(this.endpoint, formData);
  }

  update(id: string, data: Partial<Intervention>): Observable<Intervention> {
    return this.api.put<Intervention>(`${this.endpoint}/${id}`, data);
  }

  updateStatus(id: string, status: InterventionStatus): Observable<Intervention> {
    return this.api.patch<Intervention>(`${this.endpoint}/${id}/status`, { status });
  }

  assign(id: string, assignedTo: string): Observable<Intervention> {
    return this.api.patch<Intervention>(`${this.endpoint}/${id}/assign`, { assignedTo });
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  addNote(id: string, note: string): Observable<Intervention> {
    return this.api.post<Intervention>(`${this.endpoint}/${id}/notes`, { note });
  }

  updateCost(id: string, estimatedCost: number, actualCost?: number): Observable<Intervention> {
    return this.api.patch<Intervention>(`${this.endpoint}/${id}/cost`, { estimatedCost, actualCost });
  }

  getStats(proprietaireId: string): Observable<{
    total: number;
    nouveaux: number;
    enCours: number;
    resolus: number;
    urgentes: number;
    totalCost: number;
  }> {
    return this.api.get(`${this.endpoint}/stats`, { proprietaireId });
  }
}