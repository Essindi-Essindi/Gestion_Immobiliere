import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  private logements: any[] = [
    { id: '1', proprietaireIds: ['p1'], address: { street: '12 Rue de la Paix', postalCode: '75002', city: 'Paris', country: 'France' }, type: 'APPARTEMENT', status: 'LOUE', surface: 75, rooms: 3, rent: 1200, charges: 150, deposit: 2400, photos: [], diagnostics: [], createdAt: new Date('2023-01-15'), updatedAt: new Date('2024-06-01'),
      pieces: [
        { numero: 'CH-1', type: 'CHAMBRE', capacite: 1, occupants: [{ locataireId: '1', nom: 'Marie Ngo' }] },
        { numero: 'CH-2', type: 'CHAMBRE', capacite: 1, occupants: [] },
        { numero: 'CH-3', type: 'CHAMBRE', capacite: 2, occupants: [] },
        { numero: 'SAL-1', type: 'SALON', capacite: 0, occupants: [] },
        { numero: 'CUI-1', type: 'CUISINE', capacite: 0, occupants: [] },
        { numero: 'SDB-1', type: 'SALLE_DE_BAIN', capacite: 0, occupants: [] }
      ] },
    { id: '2', proprietaireIds: ['p2', 'p3'], address: { street: '45 Avenue des Champs', postalCode: '69006', city: 'Lyon', country: 'France' }, type: 'MAISON', status: 'LOUE', surface: 120, rooms: 5, rent: 1800, charges: 200, deposit: 3600, photos: [], diagnostics: [], createdAt: new Date('2022-08-10'), updatedAt: new Date('2024-05-15'),
      pieces: [
        { numero: 'CH-1', type: 'CHAMBRE', capacite: 1, occupants: [{ locataireId: '2', nom: 'Paul Kamga' }] },
        { numero: 'CH-2', type: 'CHAMBRE', capacite: 2, occupants: [] },
        { numero: 'CH-3', type: 'CHAMBRE', capacite: 1, occupants: [] },
        { numero: 'CH-4', type: 'CHAMBRE', capacite: 2, occupants: [] },
        { numero: 'SAL-1', type: 'SALON', capacite: 0, occupants: [] },
        { numero: 'CUI-1', type: 'CUISINE', capacite: 0, occupants: [] },
        { numero: 'SDB-1', type: 'SALLE_DE_BAIN', capacite: 0, occupants: [] }
      ] },
    { id: '3', proprietaireIds: ['p3'], address: { street: '8 Boulevard Victor Hugo', postalCode: '13001', city: 'Marseille', country: 'France' }, type: 'STUDIO', status: 'VACANT', surface: 32, rooms: 1, rent: 650, charges: 80, deposit: 1300, photos: [], diagnostics: [], createdAt: new Date('2024-01-20'), updatedAt: new Date('2024-07-01'),
      pieces: [
        { numero: 'CH-1', type: 'CHAMBRE', capacite: 1, occupants: [] },
        { numero: 'CUI-1', type: 'CUISINE', capacite: 0, occupants: [] },
        { numero: 'SDB-1', type: 'SALLE_DE_BAIN', capacite: 0, occupants: [] }
      ] },
    { id: '4', proprietaireIds: ['p1', 'p3'], address: { street: '23 Rue du Commerce', postalCode: '33000', city: 'Bordeaux', country: 'France' }, type: 'APPARTEMENT', status: 'LOUE', surface: 55, rooms: 2, rent: 900, charges: 120, deposit: 1800, photos: [], diagnostics: [], createdAt: new Date('2023-05-01'), updatedAt: new Date('2024-04-20'),
      pieces: [
        { numero: 'CH-1', type: 'CHAMBRE', capacite: 1, occupants: [{ locataireId: '3', nom: 'Sophie Mbarga' }] },
        { numero: 'CH-2', type: 'CHAMBRE', capacite: 2, occupants: [] },
        { numero: 'SAL-1', type: 'SALON', capacite: 0, occupants: [] },
        { numero: 'CUI-1', type: 'CUISINE', capacite: 0, occupants: [] },
        { numero: 'SDB-1', type: 'SALLE_DE_BAIN', capacite: 0, occupants: [] }
      ] },
    { id: '5', proprietaireIds: ['p2'], address: { street: '67 Place Bellecour', postalCode: '69002', city: 'Lyon', country: 'France' }, type: 'COMMERCIAL', status: 'EN_TRAVAUX', surface: 200, rooms: 8, rent: 3500, charges: 500, deposit: 7000, photos: [], diagnostics: [], createdAt: new Date('2021-11-10'), updatedAt: new Date('2024-07-10'),
      pieces: [
        { numero: 'BUR-1', type: 'BUREAU', capacite: 4, occupants: [] },
        { numero: 'BUR-2', type: 'BUREAU', capacite: 4, occupants: [] },
        { numero: 'SAL-1', type: 'SALON', capacite: 0, occupants: [] }
      ] },
    { id: '6', proprietaireIds: ['p3'], address: { street: '5 Allée des Roses', postalCode: '31000', city: 'Toulouse', country: 'France' }, type: 'APPARTEMENT', status: 'LOUE', surface: 68, rooms: 3, rent: 950, charges: 110, deposit: 1900, photos: [], diagnostics: [], createdAt: new Date('2023-09-15'), updatedAt: new Date('2024-03-10'),
      pieces: [
        { numero: 'CH-1', type: 'CHAMBRE', capacite: 1, occupants: [{ locataireId: '4', nom: 'Jean Fotso' }] },
        { numero: 'CH-2', type: 'CHAMBRE', capacite: 2, occupants: [] },
        { numero: 'SAL-1', type: 'SALON', capacite: 0, occupants: [] },
        { numero: 'CUI-1', type: 'CUISINE', capacite: 0, occupants: [] },
        { numero: 'SDB-1', type: 'SALLE_DE_BAIN', capacite: 0, occupants: [] }
      ] }
  ];

  private locataires: any[] = [
    { id: '1', firstName: 'Marie', lastName: 'Ngo', email: 'marie.ngo@email.com', phone: '+237 690 123 456', logementId: '1', logementAddress: '12 Rue de la Paix, Paris', roomNumber: 'CH-1', status: 'ACTIF', createdAt: new Date('2023-02-01') },
    { id: '2', firstName: 'Paul', lastName: 'Kamga', email: 'paul.kamga@email.com', phone: '+237 677 234 567', logementId: '2', logementAddress: '45 Avenue des Champs, Lyon', roomNumber: 'CH-1', status: 'ACTIF', createdAt: new Date('2022-09-01') },
    { id: '3', firstName: 'Sophie', lastName: 'Mbarga', email: 'sophie.mbarga@email.com', phone: '+237 655 345 678', logementId: '4', logementAddress: '23 Rue du Commerce, Bordeaux', roomNumber: 'CH-1', status: 'ACTIF', createdAt: new Date('2023-06-01') },
    { id: '4', firstName: 'Jean', lastName: 'Fotso', email: 'jean.fotso@email.com', phone: '+237 691 456 789', logementId: '6', logementAddress: '5 Allée des Roses, Toulouse', roomNumber: 'CH-1', status: 'ACTIF', createdAt: new Date('2023-10-01') },
    { id: '5', firstName: 'Claire', lastName: 'Ngono', email: 'claire.ngono@email.com', phone: '+237 670 567 890', logementId: '3', logementAddress: '8 Boulevard Victor Hugo, Marseille', roomNumber: '', status: 'INACTIF', createdAt: new Date('2024-02-01') }
  ];

  private contrats: any[] = [
    { id: '1', locataireId: '1', locataireNom: 'Marie Ngo', logementId: '1', logementAddress: '12 Rue de la Paix, Paris', roomNumber: 'CH-1', startDate: new Date('2023-02-01'), endDate: new Date('2025-01-31'), rent: 1200, charges: 150, deposit: 2400, status: 'ACTIF', contractPdf: { name: 'Bail_MarieNgo_2023.pdf', date: new Date('2023-02-01') }, createdAt: new Date('2023-02-01') },
    { id: '2', locataireId: '2', locataireNom: 'Paul Kamga', logementId: '2', logementAddress: '45 Avenue des Champs, Lyon', roomNumber: 'CH-1', startDate: new Date('2022-09-01'), endDate: new Date('2024-08-31'), rent: 1800, charges: 200, deposit: 3600, status: 'EXPIRE', contractPdf: null, createdAt: new Date('2022-09-01') },
    { id: '3', locataireId: '3', locataireNom: 'Sophie Mbarga', logementId: '4', logementAddress: '23 Rue du Commerce, Bordeaux', roomNumber: 'CH-1', startDate: new Date('2023-06-01'), endDate: new Date('2026-05-31'), rent: 900, charges: 120, deposit: 1800, status: 'ACTIF', contractPdf: null, createdAt: new Date('2023-06-01') },
    { id: '4', locataireId: '4', locataireNom: 'Jean Fotso', logementId: '6', logementAddress: '5 Allée des Roses, Toulouse', roomNumber: 'CH-1', startDate: new Date('2023-10-01'), endDate: new Date('2025-09-30'), rent: 950, charges: 110, deposit: 1900, status: 'ACTIF', contractPdf: null, createdAt: new Date('2023-10-01') },
    { id: '5', locataireId: '5', locataireNom: 'Claire Ngono', logementId: '3', logementAddress: '8 Boulevard Victor Hugo, Marseille', roomNumber: '', startDate: new Date('2024-02-01'), endDate: new Date('2024-07-31'), rent: 650, charges: 80, deposit: 1300, status: 'RESILIE', contractPdf: null, createdAt: new Date('2024-02-01') }
  ];

  private paiements: any[] = [
    { id: '1', locataireId: '1', locataireNom: 'Marie Ngo', logementId: '1', logementAddress: '12 Rue de la Paix, Paris', roomNumber: 'CH-1', amount: 1200, month: 9, year: 2026, paidAt: new Date('2026-09-02'), status: 'PAYE', type: 'LOYER', quittancePdf: { name: 'Quittance_Sep2026_MarieNgo.pdf', date: new Date('2026-09-02') }, rappelSent: false },
    { id: '2', locataireId: '2', locataireNom: 'Paul Kamga', logementId: '2', logementAddress: '45 Avenue des Champs, Lyon', roomNumber: 'CH-1', amount: 1800, month: 9, year: 2026, paidAt: null, status: 'EN_ATTENTE', type: 'LOYER', quittancePdf: null, rappelSent: false },
    { id: '3', locataireId: '3', locataireNom: 'Sophie Mbarga', logementId: '4', logementAddress: '23 Rue du Commerce, Bordeaux', roomNumber: 'CH-1', amount: 900, month: 9, year: 2026, paidAt: new Date('2026-09-05'), status: 'PAYE', type: 'LOYER', quittancePdf: null, rappelSent: false },
    { id: '4', locataireId: '4', locataireNom: 'Jean Fotso', logementId: '6', logementAddress: '5 Allée des Roses, Toulouse', roomNumber: 'CH-1', amount: 950, month: 8, year: 2026, paidAt: new Date('2026-08-30'), status: 'PAYE', type: 'LOYER', quittancePdf: { name: 'Quittance_Aout2026_JeanFotso.pdf', date: new Date('2026-08-30') }, rappelSent: false },
    { id: '5', locataireId: '1', locataireNom: 'Marie Ngo', logementId: '1', logementAddress: '12 Rue de la Paix, Paris', roomNumber: 'CH-1', amount: 1200, month: 8, year: 2026, paidAt: new Date('2026-08-03'), status: 'PAYE', type: 'LOYER', quittancePdf: { name: 'Quittance_Aout2026_MarieNgo.pdf', date: new Date('2026-08-03') }, rappelSent: false },
    { id: '6', locataireId: '4', locataireNom: 'Jean Fotso', logementId: '6', logementAddress: '5 Allée des Roses, Toulouse', roomNumber: 'CH-1', amount: 950, month: 9, year: 2026, paidAt: null, status: 'EN_RETARD', type: 'LOYER', quittancePdf: null, rappelSent: false },
    { id: '7', locataireId: '3', locataireNom: 'Sophie Mbarga', logementId: '4', logementAddress: '23 Rue du Commerce, Bordeaux', roomNumber: 'CH-1', amount: 900, month: 8, year: 2026, paidAt: new Date('2026-08-04'), status: 'PAYE', type: 'LOYER', quittancePdf: { name: 'Quittance_Aout2026_SophieMbarga.pdf', date: new Date('2026-08-04') }, rappelSent: false },
    { id: '8', locataireId: '2', locataireNom: 'Paul Kamga', logementId: '2', logementAddress: '45 Avenue des Champs, Lyon', roomNumber: 'CH-1', amount: 1800, month: 8, year: 2026, paidAt: new Date('2026-08-02'), status: 'PAYE', type: 'LOYER', quittancePdf: null, rappelSent: false },
    { id: '9', locataireId: '1', locataireNom: 'Marie Ngo', logementId: '1', logementAddress: '12 Rue de la Paix, Paris', roomNumber: 'CH-1', amount: 150, month: 9, year: 2026, paidAt: new Date('2026-09-02'), status: 'PAYE', type: 'CHARGES', quittancePdf: null, rappelSent: false },
    { id: '10', locataireId: '2', locataireNom: 'Paul Kamga', logementId: '2', logementAddress: '45 Avenue des Champs, Lyon', roomNumber: 'CH-1', amount: 200, month: 9, year: 2026, paidAt: null, status: 'EN_ATTENTE', type: 'CHARGES', quittancePdf: null, rappelSent: false }
  ];

  private interventions: any[] = [
    { id: '1', logementAddress: '12 Rue de la Paix, Paris', locataireNom: 'Marie Ngo', title: 'Fuite d\'eau salle de bain', category: 'PLOMBERIE', priority: 'URGENTE', status: 'EN_COURS', createdAt: new Date('2026-09-10'), estimatedCost: 350, actualCost: null },
    { id: '2', logementAddress: '45 Avenue des Champs, Lyon', locataireNom: 'Paul Kamga', title: 'Panne chauffage', category: 'CHAUFFAGE', priority: 'HAUTE', status: 'EN_ATTENTE', createdAt: new Date('2026-09-12'), estimatedCost: 500, actualCost: null },
    { id: '3', logementAddress: '23 Rue du Commerce, Bordeaux', locataireNom: 'Sophie Mbarga', title: 'Serrure porte d\'entrée défectueuse', category: 'SERRURERIE', priority: 'MOYENNE', status: 'EN_COURS', createdAt: new Date('2026-09-08'), estimatedCost: 200, actualCost: null },
    { id: '4', logementAddress: '5 Allée des Roses, Toulouse', locataireNom: 'Jean Fotso', title: 'Peinture salon à rafraîchir', category: 'PEINTURE', priority: 'BASSE', status: 'EN_ATTENTE', createdAt: new Date('2026-09-14'), estimatedCost: 800, actualCost: null },
    { id: '5', logementAddress: '12 Rue de la Paix, Paris', locataireNom: 'Marie Ngo', title: 'Remplacement prises électriques', category: 'ELECTRICITE', priority: 'HAUTE', status: 'TERMINE', createdAt: new Date('2026-08-20'), estimatedCost: 300, actualCost: 280 },
    { id: '6', logementAddress: '45 Avenue des Champs, Lyon', locataireNom: 'Paul Kamga', title: 'Réparation volet roulant', category: 'MENUISERIE', priority: 'NORMALE', status: 'TERMINE', createdAt: new Date('2026-08-15'), estimatedCost: 450, actualCost: 420 }
  ];

  private notifications: any[] = [
    { id: '1', title: 'Loyer en retard', message: 'Le loyer de Jean Fotso pour septembre 2026 n\'a pas été reçu.', type: 'WARNING', isRead: false, createdAt: new Date('2026-09-15') },
    { id: '2', title: 'Intervention urgente', message: 'Fuite d\'eau signalée au 12 Rue de la Paix. Intervenant en route.', type: 'ALERT', isRead: false, createdAt: new Date('2026-09-10') },
    { id: '3', title: 'Contrat expiré', message: 'Le contrat de Paul Kamga a expiré le 31/08/2024.', type: 'ERROR', isRead: false, createdAt: new Date('2026-09-01') },
    { id: '4', title: 'Paiement reçu', message: 'Marie Ngo a effectué son loyer de septembre (1 200 EUR).', type: 'SUCCESS', isRead: true, createdAt: new Date('2026-09-02') },
    { id: '5', title: 'Rappel échéance', message: 'Révision de loyer prévue le 01/01/2027 pour 3 logements.', type: 'INFO', isRead: true, createdAt: new Date('2026-09-08') },
    { id: '6', title: 'Document manquant', message: 'Diagnostic DPE du 67 Place Bellecour à mettre à jour.', type: 'WARNING', isRead: false, createdAt: new Date('2026-09-05') }
  ];

  private echeances: any[] = [
    { id: '1', date: new Date('2026-09-30'), type: 'LOYER', description: 'Échéance loyer - Marie Ngo (12 Rue de la Paix)', status: 'A_VENIR', logementAddress: '12 Rue de la Paix, Paris' },
    { id: '2', date: new Date('2026-09-30'), type: 'LOYER', description: 'Échéance loyer - Jean Fotso (5 Allée des Roses)', status: 'EN_RETARD', logementAddress: '5 Allée des Roses, Toulouse' },
    { id: '3', date: new Date('2026-10-01'), type: 'LOYER', description: 'Échéance loyer - Paul Kamga (45 Avenue des Champs)', status: 'A_VENIR', logementAddress: '45 Avenue des Champs, Lyon' },
    { id: '4', date: new Date('2026-10-01'), type: 'LOYER', description: 'Échéance loyer - Sophie Mbarga (23 Rue du Commerce)', status: 'A_VENIR', logementAddress: '23 Rue du Commerce, Bordeaux' },
    { id: '5', date: new Date('2026-12-31'), type: 'CONTRAT', description: 'Fin de contrat - Marie Ngo (12 Rue de la Paix)', status: 'A_VENIR', logementAddress: '12 Rue de la Paix, Paris' },
    { id: '6', date: new Date('2027-01-01'), type: 'LOYER', description: 'Révision annuelle des loyers (3 logements)', status: 'A_VENIR', logementAddress: 'Multiple' },
    { id: '7', date: new Date('2027-05-31'), type: 'CONTRAT', description: 'Fin de contrat - Sophie Mbarga (23 Rue du Commerce)', status: 'A_VENIR', logementAddress: '23 Rue du Commerce, Bordeaux' },
    { id: '8', date: new Date('2027-09-30'), type: 'CONTRAT', description: 'Fin de contrat - Jean Fotso (5 Allée des Roses)', status: 'A_VENIR', logementAddress: '5 Allée des Roses, Toulouse' },
    { id: '9', date: new Date('2026-11-15'), type: 'MAINTENANCE', description: 'Entretien annuel chaudière - 45 Avenue des Champs', status: 'A_VENIR', logementAddress: '45 Avenue des Champs, Lyon' },
    { id: '10', date: new Date('2027-03-01'), type: 'MAINTENANCE', description: 'Diagnostic DPE expiration - 67 Place Bellecour', status: 'A_VENIR', logementAddress: '67 Place Bellecour, Lyon' }
  ];

  private documents: any[] = [
    { id: '1', name: 'Bail_MarieNgo_2023.pdf', type: 'Contrat', date: new Date('2023-02-01'), taille: '245 Ko' },
    { id: '2', name: 'Quittance_Sep2026_MarieNgo.pdf', type: 'Quittance', date: new Date('2026-09-02'), taille: '128 Ko' },
    { id: '3', name: 'DPE_Appartement_Paris.pdf', type: 'Diagnostic', date: new Date('2025-06-15'), taille: '1.2 Mo' },
    { id: '4', name: 'Etat_Lieux_Entree_PaulKamga.pdf', type: 'Contrat', date: new Date('2022-09-01'), taille: '380 Ko' },
    { id: '5', name: 'Assurance_Propriete_Bordeaux.pdf', type: 'Autre', date: new Date('2026-01-10'), taille: '890 Ko' },
    { id: '6', name: 'Quittance_Aout2026_SophieMbarga.pdf', type: 'Quittance', date: new Date('2026-08-04'), taille: '132 Ko' },
    { id: '7', name: 'Diagnostic_Electricite_Toulouse.pdf', type: 'Diagnostic', date: new Date('2025-11-20'), taille: '950 Ko' },
    { id: '8', name: 'Bail_JeanFotso_2023.pdf', type: 'Contrat', date: new Date('2023-10-01'), taille: '260 Ko' }
  ];

  getStats(role: string): any {
    return {
      totalLogements: this.logements.length,
      logementsLoues: this.logements.filter(l => l.status === 'LOUE').length,
      locatairesActifs: this.locataires.filter(l => l.status === 'ACTIF').length,
      revenusMois: 5850,
      interventionsEnCours: this.interventions.filter(i => i.status === 'EN_COURS').length,
      tauxOccupation: Math.round((this.logements.filter(l => l.status === 'LOUE').length / this.logements.length) * 100),
      revenueLast6Months: [
        { month: 'Avr', value: 4800 },
        { month: 'Mai', value: 5200 },
        { month: 'Jun', value: 5650 },
        { month: 'Jul', value: 5500 },
        { month: 'Aoû', value: 5850 },
        { month: 'Sep', value: 5850 }
      ]
    };
  }

  getAll(collection: string): any[] {
    switch (collection) {
      case 'logements': return [...this.logements];
      case 'locataires': return [...this.locataires];
      case 'contrats': return [...this.contrats];
      case 'paiements': return [...this.paiements];
      case 'interventions': return [...this.interventions];
      case 'notifications': return [...this.notifications];
      case 'echeances': return [...this.echeances];
      case 'documents': return [...this.documents];
      default: return [];
    }
  }

  getById(collection: string, id: string): any {
    return this.getAll(collection).find((item: any) => item.id === id) || null;
  }

  resolveLocataireForUser(user: any): any {
    if (user) {
      if (user.email) {
        const byEmail = this.locataires.find(l => l.email && l.email.toLowerCase() === String(user.email).toLowerCase());
        if (byEmail) return byEmail;
      }
      const byName = this.locataires.find(l => l.firstName === user.firstName && l.lastName === user.lastName);
      if (byName) return byName;
    }
    return this.locataires.find(l => l.status === 'ACTIF') || this.locataires[0] || null;
  }

  getContratForLocataire(locataireId: string): any {
    const list = this.contrats.filter(c => c.locataireId === locataireId);
    return list.find(c => c.status === 'ACTIF') || list[0] || null;
  }

  getPaiementsForLocataire(locataireId: string): any[] {
    return this.paiements.filter(p => p.locataireId === locataireId);
  }

  getLocatairesByLogement(logementId: string): any[] {
    return this.locataires.filter(l => l.logementId === logementId);
  }

  getLogementsByProprietaire(proprietaireId: string): any[] {
    return this.logements.filter(l => (l.proprietaireIds || [l.proprietaireId]).includes(proprietaireId));
  }

  getPiecesForAssign(logementId: string): any[] {
    const log = this.logements.find(l => l.id === logementId);
    if (!log || !log.pieces) return [];
    return log.pieces.filter((p: any) => p.type === 'CHAMBRE' || p.type === 'BUREAU');
  }

  assignRoom(logementId: string, roomNumero: string, locataire: { id: string; nom: string }): boolean {
    const log = this.logements.find(l => l.id === logementId);
    if (!log || !log.pieces) return false;
    const piece = log.pieces.find((p: any) => p.numero === roomNumero);
    if (!piece) return false;
    if (piece.occupants.length >= (piece.capacite || 1)) return false;
    if (!piece.occupants.find((o: any) => o.locataireId === locataire.id)) {
      piece.occupants.push({ locataireId: locataire.id, nom: locataire.nom });
    }
    const loc = this.locataires.find(l => l.id === locataire.id);
    if (loc) {
      loc.logementId = logementId;
      loc.logementAddress = log.address.street + ', ' + log.address.city;
      loc.roomNumber = roomNumero;
    }
    return true;
  }

  releaseRoom(logementId: string, roomNumero: string, locataireId: string): void {
    const log = this.logements.find(l => l.id === logementId);
    if (log && log.pieces) {
      const piece = log.pieces.find((p: any) => p.numero === roomNumero);
      if (piece) {
        piece.occupants = piece.occupants.filter((o: any) => o.locataireId !== locataireId);
      }
    }
    const loc = this.locataires.find(l => l.id === locataireId);
    if (loc && loc.roomNumber === roomNumero) {
      loc.roomNumber = '';
    }
  }

  inviteLocataire(data: { firstName: string; lastName: string; email: string; phone: string; logementId: string; roomNumber: string }): any {
    const log = this.logements.find(l => l.id === data.logementId);
    const item = {
      id: Date.now().toString(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      logementId: data.logementId,
      logementAddress: log ? log.address.street + ', ' + log.address.city : '',
      roomNumber: '',
      status: 'ACTIF',
      createdAt: new Date()
    };
    this.locataires.unshift(item);
    if (data.roomNumber) {
      this.assignRoom(data.logementId, data.roomNumber, { id: item.id, nom: data.firstName + ' ' + data.lastName });
    }
    if (log) {
      this.paiements.unshift({
        id: 'p' + Date.now().toString(),
        locataireId: item.id,
        locataireNom: data.firstName + ' ' + data.lastName,
        logementId: data.logementId,
        logementAddress: item.logementAddress,
        roomNumber: item.roomNumber,
        amount: log.rent,
        month: 10,
        year: 2026,
        paidAt: null,
        status: 'EN_ATTENTE',
        type: 'LOYER',
        quittancePdf: null,
        rappelSent: false
      });
    }
    return item;
  }

  updateLocataire(id: string, patch: any): any {
    const loc = this.locataires.find(l => l.id === id);
    if (!loc) return null;
    const oldLogement = loc.logementId;
    const oldRoom = loc.roomNumber;
    Object.assign(loc, patch);
    if ((patch.logementId && patch.logementId !== oldLogement) || (patch.roomNumber !== undefined && patch.roomNumber !== oldRoom)) {
      if (oldRoom) this.releaseRoom(oldLogement, oldRoom, id);
      if (loc.roomNumber) {
        this.assignRoom(loc.logementId, loc.roomNumber, { id: loc.id, nom: loc.firstName + ' ' + loc.lastName });
      }
      const log = this.logements.find(l => l.id === loc.logementId);
      if (log) loc.logementAddress = log.address.street + ', ' + log.address.city;
    }
    return loc;
  }

  deleteLocataire(id: string): boolean {
    const loc = this.locataires.find(l => l.id === id);
    if (!loc) return false;
    if (loc.roomNumber) this.releaseRoom(loc.logementId, loc.roomNumber, id);
    this.locataires = this.locataires.filter(l => l.id !== id);
    return true;
  }

  setPaiementStatus(id: string, status: string): any {
    const p = this.paiements.find(x => x.id === id);
    if (!p) return null;
    p.status = status;
    p.paidAt = status === 'PAYE' ? new Date() : (status === 'EN_ATTENTE' || status === 'EN_RETARD' ? null : p.paidAt);
    return p;
  }

  sendRappel(id: string): any {
    const p = this.paiements.find(x => x.id === id);
    if (!p) return null;
    p.rappelSent = true;
    return p;
  }

  setContractPdf(contratId: string, file: { name: string; date: Date }): any {
    const c = this.contrats.find(x => x.id === contratId);
    if (!c) return null;
    c.contractPdf = file;
    return c;
  }

  removeContractPdf(contratId: string): any {
    const c = this.contrats.find(x => x.id === contratId);
    if (!c) return null;
    c.contractPdf = null;
    return c;
  }

  setQuittancePdf(paiementId: string, file: { name: string; date: Date }): any {
    const p = this.paiements.find(x => x.id === paiementId);
    if (!p) return null;
    p.quittancePdf = file;
    return p;
  }

  removeQuittancePdf(paiementId: string): any {
    const p = this.paiements.find(x => x.id === paiementId);
    if (!p) return null;
    p.quittancePdf = null;
    return p;
  }

  create(collection: string, data: any): any {
    const item = { ...data, id: Date.now().toString(), createdAt: new Date() };
    const arr = this.getCollectionRef(collection);
    if (arr) arr.unshift(item);
    return item;
  }

  update(collection: string, id: string, data: any): any {
    const arr = this.getCollectionRef(collection);
    if (!arr) return null;
    const idx = arr.findIndex((i: any) => i.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...data, updatedAt: new Date() };
    return arr[idx];
  }

  delete(collection: string, id: string): boolean {
    const arr = this.getCollectionRef(collection);
    if (!arr) return false;
    const idx = arr.findIndex((i: any) => i.id === id);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    return true;
  }

  submitIntervention(data: { titre: string; description: string; categorie: string; priorite: string }): any {
    const item = {
      id: Date.now().toString(),
      logementAddress: 'Mon logement',
      locataireNom: 'Moi',
      title: data.titre,
      category: data.categorie,
      priority: data.priorite === 'NORMALE' ? 'MOYENNE' : data.priorite,
      description: data.description,
      status: 'EN_ATTENTE',
      createdAt: new Date(),
      estimatedCost: null,
      actualCost: null
    };
    this.interventions.unshift(item);
    return {
      id: item.id,
      titre: item.title,
      categorie: item.category,
      priorite: data.priorite,
      description: item.description,
      statut: 'NOUVEAU',
      dateCreation: "Aujourd'hui",
      reponse: null
    };
  }

  markAllNotificationsAsRead(): void {
    this.notifications.forEach(n => { n.isRead = true; });
  }

  private getCollectionRef(collection: string): any[] | null {
    switch (collection) {
      case 'logements': return this.logements;
      case 'locataires': return this.locataires;
      case 'contrats': return this.contrats;
      case 'paiements': return this.paiements;
      case 'interventions': return this.interventions;
      case 'notifications': return this.notifications;
      case 'echeances': return this.echeances;
      case 'documents': return this.documents;
      default: return null;
    }
  }
}
