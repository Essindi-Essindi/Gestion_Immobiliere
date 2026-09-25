import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationResponse } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/notifications`;

  getAll(unread?: boolean, limit?: number): Observable<NotificationResponse[]> {
    let params = new HttpParams();
    if (unread !== undefined) params = params.set('unread', String(unread));
    if (limit !== undefined) params = params.set('limit', String(limit));
    return this.http.get<NotificationResponse[]>(this.api, { params });
  }

  unreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.api}/unread-count`);
  }

  markRead(id: string): Observable<void> {
    return this.http.post<void>(`${this.api}/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.post<void>(`${this.api}/read-all`, {});
  }
}
