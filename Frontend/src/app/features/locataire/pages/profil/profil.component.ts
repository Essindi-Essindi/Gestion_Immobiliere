import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profil.component.html'
})
export class ProfilComponent implements OnInit {
  profile = { firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@email.com', phone: '+33 6 12 34 56 78' };
  password = '';

  constructor(private authService: AuthService, private toastService: ToastService) {}

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.profile = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '+33 6 12 34 56 78'
      };
    }
  }

  sauvegarder(): void {
    this.toastService.success('Profil', 'Vos informations ont été mises à jour');
  }
}
