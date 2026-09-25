import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminPlateformeService } from '@core/services/admin-plateforme.service';
import { JournalResponse } from '@core/models/admin.model';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [FormsModule, StateBlockComponent],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss'
})
export class LogsComponent implements OnInit {
  searchTerm = '';
  typeFilter = '';
  fromDate = '';
  toDate = '';

  logs = signal<JournalResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  page = signal(1);
  totalPages = signal(1);
  pageSize = 10;

  constructor(private adminPlateforme: AdminPlateformeService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminPlateforme.journal({
      q: this.searchTerm || undefined,
      type: this.typeFilter || undefined,
      from: this.fromDate || undefined,
      to: this.toDate || undefined,
      page: this.page() - 1,
      size: this.pageSize
    }).subscribe({
      next: (res) => {
        this.logs.set(res.content);
        this.totalPages.set(Math.max(1, res.total_pages));
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message || 'Impossible de charger le journal.');
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.page.set(1);
    this.loadLogs();
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.loadLogs();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update(p => p + 1);
      this.loadLogs();
    }
  }
}
