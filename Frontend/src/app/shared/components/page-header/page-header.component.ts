import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="page-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="page-title">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="page-subtitle">{{ subtitle() }}</p>
          }
        </div>
        @if (actions().length) {
          <div class="header-actions">
            <ng-content select="[headerActions]"></ng-content>
          </div>
        }
      </div>
      @if (description()) {
        <p class="page-description">{{ description() }}</p>
      }
    </header>
  `,
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  description = input<string>('');
  actions = input<string[]>([]);
}