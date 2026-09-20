import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@core/services/toast.service';
import { MontantPipe, DateFrPipe } from '@shared/pipes';

@Component({
  selector: 'app-contrat',
  standalone: true,
  imports: [RouterModule, MontantPipe, DateFrPipe],
  templateUrl: './contrat.component.html'
})
export class ContratComponent implements OnInit {
  contrat: any = null;

  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const user = this.authService.user();
    const loc = this.mockDataService.resolveLocataireForUser(user);
    this.contrat = loc ? this.mockDataService.getContratForLocataire(loc.id) : null;
  }

  telechargerContrat(): void {
    if (this.contrat?.contractPdf) {
      this.toastService.success('Téléchargement', `${this.contrat.contractPdf.name} téléchargé`);
    }
  }
}
