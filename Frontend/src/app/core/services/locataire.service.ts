import { Injectable } from '@angular/core';
import { ApiService, PaginatedResponse } from '@core/http/api.service';
import { Observable } from 'rxjs';
import { Locataire, Paiement, PaiementStatus, PaiementType, Document, DocumentType, EmergencyContact, Guarantor } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class LocataireService {
  private endpoint = '/locataires';

  constructor(private api: ApiService) {}

  getAll(params?: {
    page?: number;
    size?: number;
    sort?: string;
    proprietaireId?: string;
    logementId?: string;
    search?: string;
  }): Observable<PaginatedResponse<Locataire>> {
    return this.api.get<PaginatedResponse<Locataire>>(this.endpoint, params);
  }

  getById(id: string): Observable<Locataire> {
    return this.api.get<Locataire>(`${this.endpoint}/${id}`);
  }

  create(data: Partial<Locataire>): Observable<Locataire> {
    return this.api.post<Locataire>(this.endpoint, data);
  }

  update(id: string, data: Partial<Locataire>): Observable<Locataire> {
    return this.api.put<Locataire>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getPaiements(locataireId: string, params?: {
    page?: number;
    size?: number;
    status?: PaiementStatus;
    type?: PaiementType;
    startDate?: string;
    endDate?: string;
  }): Observable<PaginatedResponse<Paiement>> {
    return this.api.get<PaginatedResponse<Paiement>>(`${this.endpoint}/${locataireId}/paiements`, params);
  }

  addPaiement(locataireId: string, data: {
    contratId: string;
    amount: number;
    type: PaiementType;
    dueDate: Date;
    method?: string;
    reference?: string;
  }): Observable<Paiement> {
    return this.api.post<Paiement>(`${this.endpoint}/${locataireId}/paiements`, data);
  }

  updatePaiement(locataireId: string, paiementId: string, data: Partial<Paiement>): Observable<Paiement> {
    return this.api.put<Paiement>(`${this.endpoint}/${locataireId}/paiements/${paiementId}`, data);
  }

  generateReceipt(paiementId: string): Observable<Blob> {
    return this.api.download(`${this.endpoint}/paiements/${paiementId}/receipt`);
  }

  getDocuments(locataireId: string): Observable<Document[]> {
    return this.api.get<Document[]>(`${this.endpoint}/${locataireId}/documents`);
  }

  uploadDocument(locataireId: string, data: { type: DocumentType; file: File; expiresAt?: Date }): Observable<Document> {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('file', data.file);
    if (data.expiresAt) {
      formData.append('expiresAt', data.expiresAt.toISOString());
    }
    return this.api.upload<Document>(`${this.endpoint}/${locataireId}/documents`, formData);
  }

  deleteDocument(locataireId: string, documentId: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${locataireId}/documents/${documentId}`);
  }

  updateEmergencyContact(locataireId: string, contact: EmergencyContact): Observable<Locataire> {
    return this.api.put<Locataire>(`${this.endpoint}/${locataireId}/emergency-contact`, contact);
  }

  updateGuarantor(locataireId: string, guarantor: Guarantor): Observable<Locataire> {
    return this.api.put<Locataire>(`${this.endpoint}/${locataireId}/guarantor`, guarantor);
  }
}