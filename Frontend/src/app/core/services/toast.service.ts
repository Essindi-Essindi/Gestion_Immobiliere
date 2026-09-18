import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private addToast(type: ToastType, title: string, message?: string, duration = 5000): string {
    const id = this.generateId();
    const toast: Toast = { id, type, title, message, duration };
    this._toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  success(title: string, message?: string, duration?: number): string {
    return this.addToast('success', title, message, duration);
  }

  error(title: string, message?: string, duration?: number): string {
    return this.addToast('error', title, message, duration);
  }

  warning(title: string, message?: string, duration?: number): string {
    return this.addToast('warning', title, message, duration);
  }

  info(title: string, message?: string, duration?: number): string {
    return this.addToast('info', title, message, duration);
  }

  remove(id: string): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}