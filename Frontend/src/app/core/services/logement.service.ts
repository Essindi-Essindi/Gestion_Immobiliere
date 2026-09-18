import { Injectable } from '@angular/core';
import { ApiService, PaginatedResponse } from './api.service';
import { Observable } from 'rxjs';
import { Logement, LogementType, LogementStatus, Photo, Diagnostic, DiagnosticType } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LogementService {
  private endpoint = '/logements';

  constructor(private api: ApiService) {}

  getAll(params?: {
    page?: number;
    size?: number;
    sort?: string;
    type?: LogementType;
    status?: LogementStatus;
    proprietaireId?: string;
    search?: string;
  }): Observable<PaginatedResponse<Logement>> {
    return this.api.get<PaginatedResponse<Logement>>(this.endpoint, params);
  }

  getById(id: string): Observable<Logement> {
    return this.api.get<Logement>(`${this.endpoint}/${id}`);
  }

  create(data: Partial<Logement>): Observable<Logement> {
    return this.api.post<Logement>(this.endpoint, data);
  }

  update(id: string, data: Partial<Logement>): Observable<Logement> {
    return this.api.put<Logement>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  uploadPhotos(id: string, files: File[]): Observable<Photo[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));
    return this.api.upload<Photo[]>(`${this.endpoint}/${id}/photos`, formData);
  }

  deletePhoto(logementId: string, photoId: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${logementId}/photos/${photoId}`);
  }

  setMainPhoto(logementId: string, photoId: string): Observable<Photo> {
    return this.api.patch<Photo>(`${this.endpoint}/${logementId}/photos/${photoId}/main`, {});
  }

  getDiagnostics(logementId: string): Observable<Diagnostic[]> {
    return this.api.get<Diagnostic[]>(`${this.endpoint}/${logementId}/diagnostics`);
  }

  addDiagnostic(logementId: string, data: { type: DiagnosticType; document: File; performedAt: Date; expiresAt?: Date }): Observable<Diagnostic> {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('document', data.document);
    formData.append('performedAt', data.performedAt.toISOString());
    if (data.expiresAt) {
      formData.append('expiresAt', data.expiresAt.toISOString());
    }
    return this.api.upload<Diagnostic>(`${this.endpoint}/${logementId}/diagnostics`, formData);
  }

  updateDiagnostic(logementId: string, diagnosticId: string, data: Partial<Diagnostic>): Observable<Diagnostic> {
    return this.api.put<Diagnostic>(`${this.endpoint}/${logementId}/diagnostics/${diagnosticId}`, data);
  }

  deleteDiagnostic(logementId: string, diagnosticId: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${logementId}/diagnostics/${diagnosticId}`);
  }

  getStats(proprietaireId: string): Observable<{
    total: number;
    loues: number;
    vacants: number;
    enTravaux: number;
    totalRent: number;
    occupancyRate: number;
  }> {
    return this.api.get(`${this.endpoint}/stats`, { proprietaireId });
  }
}