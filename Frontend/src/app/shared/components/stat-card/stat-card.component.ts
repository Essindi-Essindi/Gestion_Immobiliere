import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatIconComponent } from './stat-icon.component';

type StatTone = 'primary' | 'accent' | 'success' | 'warning' | 'info' | 'muted';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, StatIconComponent],
  template: `
    <div class="stat-card" [class]="'stat-card--' + tone()">
      <div class="stat-card__icon-wrapper">
        <div class="stat-card__icon-bg" [style.background]="iconGradient()"></div>
        <app-stat-icon [type]="icon()" [viewBox]="viewBox()"></app-stat-icon>
      </div>

      <div class="stat-card__content">
        <div class="stat-card__value">{{ value() }}</div>
        <div class="stat-card__label">{{ label() }}</div>

        @if (change()) {
          <div class="stat-card__change" [class.up]="changeValue() > 0" [class.down]="changeValue() < 0">
            <span [innerHTML]="changeIcon()"></span>
            <span>{{ changeValue() > 0 ? '+' : '' }}{{ changeValue() }}%</span>
          </div>
        }
      </div>

      @if (trend()) {
        <div class="stat-card__trend" [style.--trend-color]="trendColor()">
          <svg width="50" height="24" viewBox="0 0 50 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline [attr.points]="trendPoints()" fill="none" [attr.stroke]="trendColor()" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"></polyline>
          </svg>
        </div>
      }
    </div>
  `,
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  value = input.required<string | number>();
  label = input.required<string>();
  icon = input<'bailleurs' | 'locataires' | 'logements' | 'revenue' | 'abonnements' | 'users' | 'home' | 'money' | 'subscriptions' | 'alert' | 'clock' | 'building' | 'key' | 'calendar' | 'notification' | 'chart' | 'occupancy'>('home');
  tone = input<StatTone>('primary');
  change = input<string | null>(null);
  changeValue = input<number>(0);
  trend = input<number[] | null>(null);
  viewBox = input<string>('0 0 24 24');

  iconGradient = computed(() => {
    const gradients: Record<StatTone, string> = {
      primary: 'linear-gradient(145deg, #8fae8b, #6f8f6b)',
      accent: 'linear-gradient(145deg, #f6bfa8, #e99a7d)',
      success: 'linear-gradient(145deg, #9db498, #5f7e5c)',
      warning: 'linear-gradient(145deg, #fbe7b9, #edc876)',
      info: 'linear-gradient(145deg, #d9d2ca, #b9aea3)',
      muted: 'linear-gradient(145deg, #d9d2ca, #b9aea3)'
    };
    return gradients[this.tone()] || gradients.primary;
  });

  trendColor = computed(() => {
    const colors: Record<StatTone, string> = {
      primary: '#6f8f6b',
      accent: '#e99a7d',
      success: '#5f7e5c',
      warning: '#d9a13b',
      info: '#8fa08b',
      muted: 'var(--text-sub)'
    };
    return colors[this.tone()] || colors.primary;
  });

  changeIcon = computed(() => {
    if (!this.change()) return '';
    return this.changeValue() >= 0 
      ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>'
      : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  });

  trendPoints = computed(() => {
    const data = this.trend() || [];
    if (data.length === 0) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * 48;
      const y = 22 - ((v - min) / range) * 18;
      return `${x},${y}`;
    }).join(' ');
  });
}