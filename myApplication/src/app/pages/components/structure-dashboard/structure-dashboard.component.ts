import { Component, OnInit } from '@angular/core';
import { StructureDashboardService } from '../../services/StructureDashboard/structure-dashboard.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

// ✅ Interfaces pour le typage
interface DossierItem {
    id: number;
    numero: string;
    type: string;
    patientNom: string;
    patientPrenom: string;
    patientPolice: string;
    montantTotal: number;
    montantPrisEnCharge: number;
    montantTicketModerateur: number;
    statut: string;
    validationUab: boolean;
    dateCreation: string;
    dateConsultation?: string;
    codeInte: string;
    codeRisq: string;
    motifRejet?: string;
    structureNom?: string;
    structureId?: number;
    origine?: string;
    // ✅ CHAMPS POUR LES EXAMENS ET MÉDICAMENTS
    examenNom?: string;      // Nom de l'examen
    medicamentNom?: string;  // Nom du médicament
    datePaiement?: string;   // Date de paiement
    dateRejet?: string;   // Date de paiement
    // ✅ CHAMPS ADDITIONNELS
    examenCode?: string;      // Code de l'examen
    medicamentDosage?: string; // Dosage du médicament
    medicamentForme?: string;  // Forme du médicament
    quantite?: number;         // Quantité
}

interface MonthData {
    mois: number;
    nomMois: string;
    totalDossiers: number;
    montantTotal: number;
    montantRemboursable: number;
    dossiers: DossierItem[];
}

interface YearData {
    annee: number;
    totalDossiers: number;
    montantTotal: number;
    montantRemboursable: number;
    mois: MonthData[];
}

@Component({
    selector: 'app-structure-dashboard',
    templateUrl: './structure-dashboard.component.html',
    styleUrls: ['./structure-dashboard.component.scss']
})
export class StructureDashboardComponent implements OnInit {

    loading = false;

    // Données de la structure
    structureNom = '';
    structureType = '';
    structureId = 0;
    displayMotifDialog = false;
    selectedDossier: DossierItem | null = null;
    // Tous les dossiers de la structure
    allDossiers: DossierItem[] = [];

    // Données structurées par année et mois
    structuredData: YearData[] = [];

    // Niveaux d'expansion
    expandedYear: number | null = null;
    expandedMonth: number | null = null;

    // Statistiques
    statsGenerales = {
        totalDossiers: 0,
        enAttente: 0,
        valides: 0,
        rejetes: 0,
        montantTotalRemboursable: 0,
        montantEnAttente: 0,
        montantValides: 0,
        montantRejetes: 0
    };

    // Filtres
    searchTerm = '';
    filteredStructuredData: YearData[] = [];

    constructor(
        private dashboardService: StructureDashboardService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadDossiers();
    }

    loadDossiers(): void {
        this.loading = true;
        // Appel à l'API pour récupérer tous les dossiers de la structure
        this.dashboardService.getAllDossiersStructure().subscribe({
            next: (data) => {
                console.log('=== DOSSIERS REÇUS ===', data);
                this.allDossiers = data;
                this.extractStructureInfo();
                this.calculateStats();
                this.restructureData();
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                console.error('Erreur:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les dossiers'
                });
            }
        });
    }

    extractStructureInfo(): void {
        if (this.allDossiers.length > 0) {
            // Récupérer les infos depuis le premier dossier
            const premierDossier = this.allDossiers[0];
            this.structureNom = premierDossier.structureNom || 'Ma structure';
            this.structureId = premierDossier.structureId || 0;

            // Déterminer le type de structure basé sur le premier dossier
            const origine = premierDossier.origine || '';
            if (origine === 'HOPITAL') {
                this.structureType = 'HOPITAL';
            } else if (origine === 'PHARMACIE') {
                this.structureType = 'PHARMACIE';
            } else if (origine === 'LABORATOIRE') {
                this.structureType = 'LABORATOIRE';
            } else {
                // Sinon, essayer de déduire du type de dossier
                const type = premierDossier.type;
                if (type === 'CONSULTATION') {
                    this.structureType = 'HOPITAL';
                } else if (type === 'PRESCRIPTION_MEDICAMENT') {
                    this.structureType = 'PHARMACIE';
                } else if (type === 'PRESCRIPTION_EXAMEN') {
                    this.structureType = 'LABORATOIRE';
                }
            }
        }
    }

    calculateStats(): void {
        const total = this.allDossiers.length;

        const enAttente = this.allDossiers.filter(d =>
            d.validationUab === null || d.validationUab === undefined || d.validationUab === false
        ).length;

        const valides = this.allDossiers.filter(d => d.validationUab === true).length;
        const rejetes = this.allDossiers.filter(d => d.validationUab === false).length;

        const montantTotalRemboursable = this.allDossiers
            .filter(d => d.validationUab === true)
            .reduce((sum, d) => sum + (d.montantPrisEnCharge || 0), 0);

        const montantEnAttente = this.allDossiers
            .filter(d => d.validationUab === null || d.validationUab === undefined || d.validationUab === false)
            .reduce((sum, d) => sum + (d.montantPrisEnCharge || 0), 0);

        const montantValides = this.allDossiers
            .filter(d => d.validationUab === true)
            .reduce((sum, d) => sum + (d.montantPrisEnCharge || 0), 0);

        const montantRejetes = this.allDossiers
            .filter(d => d.validationUab === false)
            .reduce((sum, d) => sum + (d.montantPrisEnCharge || 0), 0);

        this.statsGenerales = {
            totalDossiers: total,
            enAttente,
            valides,
            rejetes,
            montantTotalRemboursable,
            montantEnAttente,
            montantValides,
            montantRejetes
        };
    }

    restructureData(): void {
        // Grouper par année
        const yearsMap = new Map<number, YearData>();

        this.allDossiers.forEach(dossier => {
            const date = dossier.dateCreation || dossier.dateConsultation || new Date().toISOString();
            const dateObj = new Date(date);
            const annee = dateObj.getFullYear();
            const mois = dateObj.getMonth() + 1;
            const montant = dossier.montantPrisEnCharge || 0;
            const isValide = dossier.validationUab === true;

            if (!yearsMap.has(annee)) {
                yearsMap.set(annee, {
                    annee,
                    totalDossiers: 0,
                    montantTotal: 0,
                    montantRemboursable: 0,
                    mois: []
                });
            }

            const yearData = yearsMap.get(annee)!;
            yearData.totalDossiers++;
            yearData.montantTotal += montant;
            if (isValide) {
                yearData.montantRemboursable += montant;
            }

            // Gérer les mois
            let monthData = yearData.mois.find(m => m.mois === mois);
            if (!monthData) {
                monthData = {
                    mois,
                    nomMois: this.getNomMois(mois),
                    totalDossiers: 0,
                    montantTotal: 0,
                    montantRemboursable: 0,
                    dossiers: []
                };
                yearData.mois.push(monthData);
            }

            monthData.totalDossiers++;
            monthData.montantTotal += montant;
            if (isValide) {
                monthData.montantRemboursable += montant;
            }
            monthData.dossiers.push(dossier);
        });

        // Trier les années par ordre décroissant et les mois par ordre croissant
        this.structuredData = Array.from(yearsMap.values())
            .map(year => ({
                ...year,
                mois: year.mois.sort((a, b) => a.mois - b.mois)
            }))
            .sort((a, b) => b.annee - a.annee);

        this.filteredStructuredData = [...this.structuredData];
        console.log('Données structurées:', this.structuredData);
    }

    filterData(): void {
        if (!this.searchTerm.trim()) {
            this.filteredStructuredData = [...this.structuredData];
            return;
        }

        const searchLower = this.searchTerm.toLowerCase().trim();

        this.filteredStructuredData = this.structuredData
            .map(year => ({
                ...year,
                mois: year.mois
                    .map(month => ({
                        ...month,
                        dossiers: month.dossiers.filter(d =>
                            (d.patientNom?.toLowerCase() || '').includes(searchLower) ||
                            (d.patientPrenom?.toLowerCase() || '').includes(searchLower) ||
                            (d.patientPolice?.toLowerCase() || '').includes(searchLower) ||
                            (d.numero?.toLowerCase() || '').includes(searchLower)
                        )
                    }))
                    .filter(month => month.dossiers.length > 0)
            }))
            .filter(year => year.mois.length > 0);
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.filteredStructuredData = [...this.structuredData];
    }

    toggleYear(annee: number): void {
        this.expandedYear = this.expandedYear === annee ? null : annee;
        this.expandedMonth = null;
    }

    toggleMonth(mois: number): void {
        this.expandedMonth = this.expandedMonth === mois ? null : mois;
    }

    voirDetailDossier(dossier: DossierItem): void {
        console.log('Navigation vers validation:', dossier.id, dossier.type);

        // Utiliser la route structure/validation
        this.router.navigate(['/structure/validation', dossier.id], {
            queryParams: { type: dossier.type }
        });
    }

    getStatusClass(dossier: DossierItem): string {
        if (dossier.validationUab === true) { return 'status-success'; }
        if (dossier.validationUab === false) { return 'status-danger'; }
        return 'status-warning';
    }

    getStatusLabel(dossier: DossierItem): string {
        if (dossier.validationUab === true) { return 'Validé'; }
        if (dossier.validationUab === false) { return 'Rejeté'; }
        return 'En attente';
    }

    getTypeLabel(type: string): string {
        const labels: { [key: string]: string } = {
            CONSULTATION: 'Consultation',
            PRESCRIPTION_MEDICAMENT: 'Médicament',
            PRESCRIPTION_EXAMEN: 'Examen'
        };
        return labels[type] || type;
    }

    getTypeIcon(type: string): string {
        const icons: { [key: string]: string } = {
            CONSULTATION: 'pi pi-folder-open',
            PRESCRIPTION_MEDICAMENT: 'pi pi-tablets',
            PRESCRIPTION_EXAMEN: 'pi pi-microscope'
        };
        return icons[type] || 'pi pi-file';
    }

    getNomMois(mois: number): string {
        const moisNoms = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return moisNoms[mois - 1] || '';
    }

    getTotalDossiers(): number {
        return this.filteredStructuredData.reduce(
            (sum, year) => sum + year.totalDossiers, 0
        );
    }

    getMontantTotalRemboursable(): number {
        return this.filteredStructuredData.reduce(
            (sum, year) => sum + year.montantRemboursable, 0
        );
    }

    afficherMotifRejet(dossier: DossierItem): void {
        this.selectedDossier = dossier;
        this.displayMotifDialog = true;
    }


}
