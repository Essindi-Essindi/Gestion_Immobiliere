import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-state-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './state-block.component.html',
  styleUrl: './state-block.component.scss'
})
export class StateBlockComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() empty = false;
  @Input() emptyMessage = 'Aucune donnée à afficher.';
}
