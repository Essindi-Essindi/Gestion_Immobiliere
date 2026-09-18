import { Injectable } from '@angular/core';
import { ApiService, PaginatedResponse } from '@core/http/api.service';
import { Observable } from 'rxjs';
import type {
  Notification as AppNotification,
  NotificationType,
  NotificationFormData,
  NotificationPreferences
} from '../models/notification.model';

export type {
  Notification as AppNotification,
  NotificationType,
  NotificationFormData,
  NotificationPreferences
} from '../models/notification.model';

export type { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private endpoint = '/notifications';

  constructor(private api: ApiService) {}

  getAll(params?: {
    page?: number;
    size?: number;
    sort?: string;
    isRead?: boolean;
    type?: NotificationType;
  }): Observable<PaginatedResponse<AppNotification>> {
    return this.api.get<PaginatedResponse<AppNotification>>(this.endpoint, params);
  }

  getById(id: string): Observable<AppNotification> {
    return this.api.get<AppNotification>(`${this.endpoint}/${id}`);
  }

  markAsRead(id: string): Observable<AppNotification> {
    return this.api.patch<AppNotification>(`${this.endpoint}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.api.patch<void>(`${this.endpoint}/read-all`, {});
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  send(data: NotificationFormData): Observable<AppNotification[]> {
    return this.api.post<AppNotification[]>(`${this.endpoint}/send`, data);
  }

  sendToUser(userId: string, data: Omit<NotificationFormData, 'userIds'>): Observable<AppNotification> {
    return this.api.post<AppNotification>(`${this.endpoint}/send/${userId}`, data);
  }

  getPreferences(): Observable<NotificationPreferences> {
    return this.api.get<NotificationPreferences>(`${this.endpoint}/preferences`);
  }

  updatePreferences(preferences: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    return this.api.put<NotificationPreferences>(`${this.endpoint}/preferences`, preferences);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.api.get<{ count: number }>(`${this.endpoint}/unread-count`);
  }
}
