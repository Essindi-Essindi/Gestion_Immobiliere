import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContratService } from '@core/services/contrat.service';
import { LogementService } from '@core/services/logement.service';
import { LocataireService } from '@core/services/locataire.service';
import { ToastService } from '@core/services/toast.service';
import { MontantPipe, DateFrPipe } from '@shared/pipes';
import { StateBlockComponent } from '@shared/components/state-block/state-block.component';
import { ContratRequest, ContratResponse } from '@core/models/contrat.model';
import { LogementResponse } from '@core/models/logement.model';
import { LocataireResponse } from '@core/models/locataire.model';
import { DocumentResponse } from '@core/models/document.model';

@Component({
  selector: 'app-contrats',
  standalone: true,
  imports: [RouterModule, FormsModule, MontantPipe, DateFrPipe, StateBlockComponent],
  templateUrl: './contrats.component.html'
})
export class ContratsComponent implements OnInit, OnDestroy {
  loading = signal(true);
  error = signal<string | null>(null);

  contrats = signal<ContratResponse[]>([]);
  allLogements = signal<LogementResponse[]>([]);
  allLocataires = signal<LocataireResponse[]>([]);
  filterActif = '';

  groupedContrats = computed(() => {
    const map = new Map<string, { logementId: string; address: string; items: ContratResponse[] }>();
    for (const c of this.contrats()) {
      if (!map.has(c.logement_id)) {
        map.set(c.logement_id, { logementId: c.logement_id, address: c.logement_address, items: [] });
      }
      map.get(c.logement_id)!.items.push(c);
    }
    return Array.from(map.values());
  });

  showCreate = signal(false);
  createForm: ContratRequest = this.emptyForm();

  terminateTarget: ContratResponse | null = null;
  showTerminateConfirm = signal(false);

  inserted = signal<Set<string>>(new Set());
  insertTarget: ContratResponse | null = null;

  docView = signal<{ contrat: ContratResponse; doc: DocumentResponse | null; loading: boolean } | null>(null);

  // detecte les demandes de resiliation des locataires sans avoir a rafraichir la page a la main
  // picks up tenants' termination requests without a manual page refresh
  private pollHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    private contratService: ContratService,
    private logementService: LogementService,
    private locataireService: LocataireService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.refresh();
    this.logementService.getAll().subscribe({ next: (l) => this.allLogements.set(l), error: () => {} });
    this.locataireService.getAll().subscribe({ next: (l) => this.allLocataires.set(l), error: () => {} });
    this.contratService.inserted().subscribe({ next: (ids) => this.inserted.set(new Set(ids.map(String))), error: () => {} });
    this.pollHandle = setInterval(() => this.refresh(), 20000);
  }

  ngOnDestroy(): void {
    if (this.pollHandle) clearInterval(this.pollHandle);
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    const actif = this.filterActif === '' ? undefined : this.filterActif === 'true';
    this.contratService.getAll(actif).subscribe({
      next: (data) => {
        this.contrats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les contrats');
        this.loading.set(false);
      }
    });
  }

  onFilterActif(event: Event): void {
    this.filterActif = (event.target as HTMLSelectElement).value;
    this.refresh();
  }

  private emptyForm(): ContratRequest {
    return { start_date: '', end_date: '', monthly_rent: 0, deposit: 0, logement_id: '', locataire_id: '' };
  }

  openCreate(): void {
    this.createForm = this.emptyForm();
    this.showCreate.set(true);
  }
  closeCreate(): void { this.showCreate.set(false); }

  saveCreate(): void {
    const f = this.createForm;
    if (!f.start_date || !f.logement_id || !f.locataire_id || !f.monthly_rent) {
      this.toast.warning('Attention', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    const payload: ContratRequest = { ...f, end_date: f.end_date || undefined };
    this.contratService.create(payload).subscribe({
      next: () => {
        this.toast.success('Contrat créé', 'Le contrat a été créé');
        this.closeCreate();
        this.refresh();
      },
      error: () => this.toast.error('Erreur', 'Impossible de créer le contrat')
    });
  }

  askTerminate(c: ContratResponse): void {
    if (!c.resiliation_demandee) {
      this.toast.warning('Attention', 'Le locataire doit d\'abord demander la résiliation depuis son espace');
      return;
    }
    this.terminateTarget = c;
    this.showTerminateConfirm.set(true);
  }
  confirmTerminate(): void {
    if (!this.terminateTarget) return;
    this.contratService.terminate(this.terminateTarget.id).subscribe({
      next: () => {
        this.showTerminateConfirm.set(false);
        this.terminateTarget = null;
        this.toast.success('Contrat résilié', 'Le contrat a été résilié');
        this.refresh();
      },
      error: () => this.toast.error('Erreur', 'Impossible de résilier le contrat')
    });
  }

  viewPdf(c: ContratResponse): void {
    this.contratService.pdf(c.id).subscribe({
      next: (blob) => window.open(URL.createObjectURL(blob)),
      error: () => this.toast.error('Erreur', 'Impossible de générer le PDF')
    });
  }

  isinserted(c: ContratResponse): boolean {
    return this.inserted().has(String(c.id));
  }

  pick(c: ContratResponse, picker: HTMLInputElement): void {
    this.insertTarget = c;
    picker.value = '';
    picker.click();
  }

  onfile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const c = this.insertTarget;
    if (!file || !c) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.toast.warning('Attention', 'Le fichier doit être un PDF');
      return;
    }
    this.contratService.insert(c.id, file).subscribe({
      next: () => {
        this.inserted.update(s => new Set(s).add(String(c.id)));
        this.toast.success('Contrat inséré', `Le contrat de ${c.locataire_name} a été enregistré`);
      },
      error: () => this.toast.error('Erreur', "Impossible d'insérer le contrat")
    });
  }

  openDocument(c: ContratResponse): void {
    this.docView.set({ contrat: c, doc: null, loading: true });
    this.contratService.document(c.id).subscribe({
      next: (doc) => this.docView.set({ contrat: c, doc, loading: false }),
      error: () => {
        this.docView.set({ contrat: c, doc: null, loading: false });
        this.toast.error('Erreur', 'Impossible de récupérer le statut du document');
      }
    });
  }
  closeDocument(): void { this.docView.set(null); }
}
