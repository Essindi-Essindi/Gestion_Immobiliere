import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EspaceLocataireService } from '@core/services/espace-locataire.service';
import { ToastService } from '@core/services/toast.service';
import { LocataireResponse } from '@core/models/locataire.model';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [FormsModule, StateBlockComponent],
  templateUrl: './profil.component.html'
})
export class ProfilComponent implements OnInit {
  profile = signal<LocataireResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);
  phone = '';
  lastName = '';
  firstName = '';

  constructor(private espaceLocataireService: EspaceLocataireService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.espaceLocataireService.profile().subscribe({
      next: p => {
        this.profile.set(p);
        this.phone = p.phone;
        this.lastName = p.last_name;
        this.firstName = p.first_name;
        this.loading.set(false);
      },
      error: () => { this.error.set('Impossible de charger votre profil.'); this.loading.set(false); }
    });
  }

  sauvegarder(): void {
    this.saving.set(true);
    this.espaceLocataireService.updateProfile({ last_name: this.lastName, first_name: this.firstName, phone: this.phone }).subscribe({
      next: p => {
        this.profile.set(p);
        this.toastService.success('Profil', 'Vos informations ont été mises à jour');
        this.saving.set(false);
      },
      error: () => {
        this.toastService.error('Erreur', 'La mise à jour a échoué.');
        this.saving.set(false);
      }
    });
  }
}
