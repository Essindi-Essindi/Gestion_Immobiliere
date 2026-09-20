import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _loadingCount = signal(0);
  private _loadingMessages = signal<Map<string, string>>(new Map());

  isLoading = computed(() => this._loadingCount() > 0);
  loadingMessage = computed(() => {
    const messages = Array.from(this._loadingMessages().values());
    return messages.length > 0 ? messages[messages.length - 1] : '';
  });

  show(message = 'Chargement...'): string {
    const id = Math.random().toString(36).substr(2, 9);
    this._loadingMessages.update(map => new Map(map).set(id, message));
    this._loadingCount.update(count => count + 1);
    return id;
  }

  hide(id: string): void {
    this._loadingMessages.update(map => {
      const newMap = new Map(map);
      newMap.delete(id);
      return newMap;
    });
    this._loadingCount.update(count => Math.max(0, count - 1));
  }

  hideAll(): void {
    this._loadingMessages.set(new Map());
    this._loadingCount.set(0);
  }
}