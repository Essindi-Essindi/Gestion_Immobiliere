import { Injectable } from '@angular/core';
import { ApiService, PaginatedResponse } from '@core/http/api.service';
import { Observable } from 'rxjs';
import { Contrat, ContratStatus, ContratFormData, Document, DocumentType } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class ContratService {
  private endpoint = '/contrats';

  constructor(private api: ApiService) {}

  getAll(params?: {
    page?: number;
    size?: number;
    sort?: string;
    status?: ContratStatus;
    proprietaireId?: string;
    locataireId?: string;
    logementId?: string;
    search?: string;
  }): Observable<PaginatedResponse<Contrat>> {
    return this.api.get<PaginatedResponse<Contrat>>(this.endpoint, params);
  }

  getById(id: string): Observable<Contrat> {
    return this.api.get<Contrat>(`${this.endpoint}/${id}`);
  }

  create(data: ContratFormData): Observable<Contrat> {
    return this.api.post<Contrat>(this.endpoint, data);
  }

  update(id: string, data: Partial<ContratFormData>): Observable<Contrat> {
    return this.api.put<Contrat>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  generatePdf(id: string): Observable<Blob> {
    return this.api.download(`${this.endpoint}/${id}/pdf`);
  }

  signContract(id: string): Observable<Contrat> {
    return this.api.post<Contrat>(`${this.endpoint}/${id}/sign`, {});
  }

  terminateContract(id: string, data: { reason: string; effectiveDate: Date }): Observable<Contrat> {
    return this.api.post<Contrat>(`${this.endpoint}/${id}/terminate`, data);
  }

  renewContract(id: string, data: { newEndDate: Date; newRent?: number }): Observable<Contrat> {
    return this.api.post<Contrat>(`${this.endpoint}/${id}/renew`, data);
  }

  getDocuments(contratId: string): Observable<Document[]> {
    return this.api.get<Document[]>(`${this.endpoint}/${contratId}/documents`);
  }

  uploadDocument(contratId: string, data: { type: DocumentType; file: File }): Observable<Document> {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('file', data.file);
    return this.api.upload<Document>(`${this.endpoint}/${contratId}/documents`, formData);
  }

  deleteDocument(contratId: string, documentId: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${contratId}/documents/${documentId}`);
  }

  getExpiringContracts(proprietaireId: string, days = 30): Observable<Contrat[]> {
    return this.api.get<Contrat[]>(`${this.endpoint}/expiring`, { proprietaireId, days });
  }

  getRentRevisionContracts(proprietaireId: string): Observable<Contrat[]> {
    return this.api.get<Contrat[]>(`${this.endpoint}/rent-revision`, { proprietaireId });
  }
}