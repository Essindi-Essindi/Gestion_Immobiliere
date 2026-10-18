import { Component, input, computed, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

type IconType = 'bailleurs' | 'locataires' | 'logements' | 'revenue' | 'abonnements' | 'users' | 'home' | 'money' | 'subscriptions' | 'alert' | 'clock' | 'building' | 'key' | 'calendar' | 'notification' | 'chart' | 'occupancy';

@Component({
  selector: 'app-stat-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [attr.viewBox]="viewBox()" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stat-svg">
      <ng-container [ngSwitch]="type()">
        <!-- Bailleurs / Users -->
        <ng-container *ngSwitchCase="'bailleurs'">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </ng-container>
        
        <!-- Locataires / Users simple -->
        <ng-container *ngSwitchCase="'locataires'">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </ng-container>
        
        <!-- Logements / Building -->
        <ng-container *ngSwitchCase="'logements'">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </ng-container>
        
        <!-- Revenue / Money -->
        <ng-container *ngSwitchCase="'revenue'">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </ng-container>
        
        <!-- Abonnements / Subscriptions -->
        <ng-container *ngSwitchCase="'abonnements'">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </ng-container>
        
        <!-- Alert -->
        <ng-container *ngSwitchCase="'alert'">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </ng-container>
        
        <!-- Clock / Calendar -->
        <ng-container *ngSwitchCase="'clock'">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </ng-container>
        
        <ng-container *ngSwitchCase="'calendar'">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </ng-container>
        
        <!-- Notification -->
        <ng-container *ngSwitchCase="'notification'">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </ng-container>
        
        <!-- Chart -->
        <ng-container *ngSwitchCase="'chart'">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="16"/>
        </ng-container>
        
        <!-- Occupancy / Building with people -->
        <ng-container *ngSwitchCase="'occupancy'">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </ng-container>
        
        <!-- Default: generic home -->
        <ng-container *ngSwitchDefault>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </ng-container>
      </ng-container>
    </svg>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .stat-svg {
      width: 100%;
      height: 100%;
    }
  `]
})
export class StatIconComponent {
  type = input<IconType>('home');
  viewBox = input<string>('0 0 24 24');
  
  @HostBinding('class') hostClass = 'stat-svg-host';
}