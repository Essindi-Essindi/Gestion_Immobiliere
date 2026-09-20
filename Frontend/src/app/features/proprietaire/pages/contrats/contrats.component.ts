import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { MontantPipe, DateFrPipe } from '@shared/pipes';

@Component({
  selector: 'app-contrats',
  standalone: true,
  imports: [RouterModule, MontantPipe, DateFrPipe],
  templateUrl: './contrats.component.html'
})
export class ContratsComponent implements OnInit {
  contrats = signal<any[]>([]);
  pdfView = signal<any>(null);

  groupedContrats = computed(() => {
    const map = new Map<string, any>();
    for (const c of this.contrats()) {
      if (!map.has(c.logementId)) {
        map.set(c.logementId, { logementId: c.logementId, address: c.logementAddress, items: [] });
      }
      map.get(c.logementId).items.push(c);
    }
    return Array.from(map.values());
  });

  constructor(private mockData: MockDataService, private toast: ToastService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.contrats.set(this.mockData.getAll('contrats'));
  }

  onInsertPdf(contrat: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    this.mockData.setContractPdf(contrat.id, { name: file.name, date: new Date() });
    this.refresh();
    this.toast.success('Contrat inséré', `${file.name} ajouté au profil de ${contrat.locataireNom}`);
    input.value = '';
  }

  onReplacePdf(contrat: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    this.mockData.setContractPdf(contrat.id, { name: file.name, date: new Date() });
    this.refresh();
    this.toast.success('Contrat remplacé', `Nouveau document : ${file.name}`);
    input.value = '';
  }

  removePdf(contrat: any): void {
    this.mockData.removeContractPdf(contrat.id);
    this.refresh();
    this.toast.success('Document supprimé', 'Le contrat PDF a été retiré');
  }

  openPdfView(contrat: any): void { this.pdfView.set(contrat); }

  downloadPdf(): void {
    this.toast.success('Téléchargement', `${this.pdfView().contractPdf.name} téléchargé`);
    this.pdfView.set(null);
  }

}
