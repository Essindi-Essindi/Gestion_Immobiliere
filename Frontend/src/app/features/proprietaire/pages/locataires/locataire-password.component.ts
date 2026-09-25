import { Component, OnInit, signal } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LocataireService } from '@core/services/locataire.service';
import { LocataireResponse } from '@core/models/locataire.model';

@Component({
  selector: 'app-locataire-password',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './locataire-password.component.html'
})
export class LocatairePasswordComponent implements OnInit {
  locataire = signal<LocataireResponse | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locataireService: LocataireService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.locataireService.getById(id).subscribe({
      next: (loc) => {
        this.locataire.set(loc);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  ok(): void {
    this.router.navigate(['/proprietaire/locataires']);
  }
}
