// pages/components/uab/dossiers/dossiers.component.ts - VERSION OPTIMISÉE
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UabService } from '../../../services/uab/uab.service';
import { CacheService } from '../../../services/cache/cache.service';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {Structure} from '../../../models/structure';
import {StructureService} from '../../../services/structure/structure.service';

@Component({
    selector: 'app-dossiers',
    templateUrl: './dossiers.component.html',
    styleUrls: ['./dossiers.component.scss']
})
export class DossiersComponent implements OnInit, OnDestroy {

    dossiers: any[] = [];
    filteredDossiers: any[] = [];
    loading = false;

    // Filtres
    searchPolice = '';
    selectedTypeDossier = '';
    selectedStructureId: number | null = null;
    selectedStatut = '';
    dateDebut: Date | null = null;
    dateFin: Date | null = null;
    structures: Structure[] = [];

    // Options pour les dropdowns
    typeDossiers = [
        { label: 'Tous les types', value: '' },
        { label: 'Consultation', value: 'CONSULTATION' },
        { label: 'Prescription Médicament', value: 'PRESCRIPTION_MEDICAMENT' },
        { label: 'Prescription Examen', value: 'PRESCRIPTION_EXAMEN' }
    ];

    statuts = [
        { label: 'Tous les statuts', value: '' },
        { label: 'En attente', value: 'EN_ATTENTE' },
        { label: 'Validé UAB', value: 'VALIDEE_UAB' },
        { label: 'Rejeté', value: 'REJETEE_UAB' }
    ];


    // Dialog validation rapide
    displayValidationDialog = false;
    selectedDossier: any = null;

    // ✅ PAGINATION
    totalRecords = 0;
    currentPage = 0;
    pageSize = 10;
    rowsPerPageOptions = [5, 10, 20, 50, 100];

    // Ajouter ces propriétés dans la classe
    selectedMois: number | null = null;
    selectedAnnee: number | null = null;
    selectedNomMois = '';

    // ✅ Debounce pour la recherche
    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    constructor(
        private uabService: UabService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private structureService: StructureService,
        private cacheService: CacheService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.loadStructures();
        this.loadDossiers();
        this.setupDebounceSearch();

        // Récupérer les paramètres d'URL si présents
        this.route.queryParams.subscribe(params => {
            if (params.structureId) {
                this.selectedStructureId = +params.structureId;
            }
            if (params.statut) {
                this.selectedStatut = params.statut;
            }
            if (params.structureNom) {
                // Pour affichage
                console.log('Filtre structure:', params.structureNom);
            }

            // ✅ NOUVEAU: Récupérer les filtres de mois
            if (params.mois) {
                this.selectedMois = +params.mois;
                this.selectedAnnee = params.annee ? +params.annee : new Date().getFullYear();
                this.selectedNomMois = params.nomMois || '';
                console.log(`Filtre mois appliqué: ${this.selectedNomMois} ${this.selectedAnnee}`);
            }

            this.loadDossiers();
        });

        this.setupDebounceSearch();
    }



    // ✅ Configuration du debounce pour la recherche
    setupDebounceSearch(): void {
        this.searchSubject.pipe(
            debounceTime(500), // Attendre 500ms après la dernière frappe
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(searchTerm => {
            this.searchPolice = searchTerm;
            this.currentPage = 0; // Reset à la première page
            this.loadDossiers();
        });
    }

    // ✅ Appelé à chaque frappe dans le champ de recherche
    onSearchInput(event: any): void {
        this.searchSubject.next(event.target.value);
    }

    loadStructures(): void {
        // Vérifier le cache
        const cachedStructures = this.cacheService.get('structures_list');
        if (cachedStructures) {
            this.structures = cachedStructures;
            console.log('Structures chargées depuis le cache:', this.structures.length);
            return;
        }

        // Charger depuis l'API
        this.structureService.getAllStructures().subscribe({
            next: (data) => {
                // ✅ Ne garder que les structures actives
                this.structures = data.filter(s => s.actif === true);
                this.cacheService.set('structures_list', this.structures, 30 * 60 * 1000);
                console.log('Structures chargées depuis l\'API:', this.structures.length);
            },
            error: (error) => {
                console.error('Erreur chargement structures:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger la liste des structures'
                });
            }
        });
    }


    loadStructurest(): void {
        // ✅ Mise en cache des structures (peuvent être mises en cache longtemps)
        const cachedStructures = this.cacheService.get('structures_list');
        if (cachedStructures) {
            this.structures = cachedStructures;
            console.log('Structures chargées depuis le cache');
            return;
        }

        this.uabService.getStructures().subscribe({
            next: (data) => {
                this.structures = data;
                this.cacheService.set('structures_list', data, 30 * 60 * 1000); // Cache 30 minutes
            },
            error: (error) => {
                console.error('Erreur chargement structures:', error);
            }
        });
    }

    // ✅ Version optimisée avec pagination
    // dossiers.component.ts - Modifier loadDossiers()

    loadDossiers(): void {
        this.loading = true;

        // Construire les filtres
        const filters: any = {};
        if (this.selectedStatut) { filters.statut = this.selectedStatut; }
        if (this.searchPolice) { filters.numeroPolice = this.searchPolice; }
        if (this.selectedStructureId) { filters.structureId = this.selectedStructureId; }

        // Appel API paginé
        this.uabService.getAllDossiersPaginated(this.currentPage, this.pageSize, filters.statut, filters.numeroPolice)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.dossiers = response.content;

                    // ✅ APPLIQUER LE FILTRE MOIS IMMÉDIATEMENT
                    let filtered = [...this.dossiers];

                    // ✅ Filtre par mois si présent
                    if (this.selectedMois && this.selectedAnnee) {
                        filtered = filtered.filter(d => {
                            const date = new Date(d.dateCreation || d.dateConsultation);
                            const dossierMois = date.getMonth() + 1;
                            const dossierAnnee = date.getFullYear();
                            return dossierMois === this.selectedMois && dossierAnnee === this.selectedAnnee;
                        });
                        console.log(`✅ Filtre mois appliqué: ${this.selectedNomMois} ${this.selectedAnnee}, résultant: ${filtered.length} dossiers`);
                    }

                    // ✅ Appliquer les autres filtres
                    if (this.selectedTypeDossier) {
                        filtered = filtered.filter(d => d.type === this.selectedTypeDossier);
                    }

                    if (this.selectedStructureId) {
                        filtered = filtered.filter(d => d.structureId === this.selectedStructureId);
                    }

                    if (this.selectedStatut) {
                        filtered = filtered.filter(d => this.getStatusValue(d) === this.selectedStatut);
                    }

                    this.filteredDossiers = filtered;
                    this.totalRecords = filtered.length;
                    this.loading = false;
                    console.log(`Dossiers chargés: page ${this.currentPage}, total après filtres: ${this.totalRecords}`);
                },
                error: (error) => {
                    console.error('Erreur chargement paginé:', error);
                    this.loadDossiersLegacy();
                }
            });
    }

    // ✅ Fallback si la pagination échoue (compatible avec l'ancien code)
    // dossiers.component.ts - Modifier loadDossiersLegacy()
    loadDossiersLegacy(): void {
        this.uabService.getAllDossiers(this.selectedStatut, this.searchPolice)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.dossiers = data;
                    let filtered = [...data];

                    // ✅ Filtre par mois si présent
                    if (this.selectedMois && this.selectedAnnee) {
                        filtered = filtered.filter(d => {
                            const date = new Date(d.dateCreation || d.dateConsultation);
                            const dossierMois = date.getMonth() + 1;
                            const dossierAnnee = date.getFullYear();
                            return dossierMois === this.selectedMois && dossierAnnee === this.selectedAnnee;
                        });
                        console.log(`✅ Filtre mois Legacy appliqué: ${this.selectedNomMois} ${this.selectedAnnee}`);
                    }

                    // ✅ Appliquer les autres filtres
                    if (this.selectedTypeDossier) {
                        filtered = filtered.filter(d => d.type === this.selectedTypeDossier);
                    }

                    if (this.selectedStructureId) {
                        filtered = filtered.filter(d => d.structureId === this.selectedStructureId);
                    }

                    this.filteredDossiers = filtered;
                    this.totalRecords = filtered.length;
                    this.loading = false;
                },
                error: (error) => {
                    this.loading = false;
                    console.error('Erreur chargement dossiers:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de charger les dossiers'
                    });
                }
            });
    }

    // ✅ Changement de page
    onPageChange(event: any): void {
        this.currentPage = event.first / event.rows;
        this.pageSize = event.rows;
        this.loadDossiers();
    }

    search(): void {
        this.currentPage = 0;
        this.loadDossiers();
    }

    reset(): void {
        this.searchPolice = '';
        this.selectedTypeDossier = '';
        this.selectedStructureId = null;
        this.selectedStatut = '';
        this.dateDebut = null;
        this.dateFin = null;
        this.selectedMois = null;      // ✅ Réinitialiser le mois
        this.selectedAnnee = null;     // ✅ Réinitialiser l'année
        this.selectedNomMois = '';     // ✅ Réinitialiser le nom du mois
        this.currentPage = 0;

        this.cacheService.remove('dossiers_search');
        this.loadDossiers();
    }

    // ✅ applyFilters conservé pour la compatibilité avec le fallback
    applyFilters(): void {
        let result = [...this.dossiers];

        // Filtre par numéro de police
        if (this.searchPolice) {
            const police = this.searchPolice.toLowerCase();
            result = result.filter(d =>
                (d.patientPolice && d.patientPolice.toLowerCase().includes(police)) ||
                (d.numeroPolice && d.numeroPolice.toLowerCase().includes(police))
            );
        }

        // Filtre par type de dossier
        if (this.selectedTypeDossier) {
            result = result.filter(d => d.type === this.selectedTypeDossier);
        }

        // Filtre par structure
        if (this.selectedStructureId) {
            result = result.filter(d => d.structureId === this.selectedStructureId);
        }

        // Filtre par statut
        if (this.selectedStatut) {
            result = result.filter(d => {
                const statut = this.getStatusValue(d);
                return statut === this.selectedStatut;
            });
        }

        // ✅ NOUVEAU: Filtre par mois et année
        if (this.selectedMois && this.selectedAnnee) {
            result = result.filter(d => {
                const date = new Date(d.dateCreation || d.dateConsultation);
                const dossierMois = date.getMonth() + 1;
                const dossierAnnee = date.getFullYear();
                return dossierMois === this.selectedMois && dossierAnnee === this.selectedAnnee;
            });
        }

        // Filtre par période (date début/fin) - priorité au mois si présent
        if (!this.selectedMois) {
            if (this.dateDebut) {
                const dateDebutStr = this.formatDate(this.dateDebut);
                result = result.filter(d => {
                    const date = d.dateConsultation || d.dateCreation;
                    return date && date >= dateDebutStr;
                });
            }
            if (this.dateFin) {
                const dateFinStr = this.formatDate(this.dateFin);
                result = result.filter(d => {
                    const date = d.dateConsultation || d.dateCreation;
                    return date && date <= dateFinStr;
                });
            }
        }

        this.filteredDossiers = result;
        this.totalRecords = result.length;
    }


    // ==================== MÉTHODES DE STATUT ====================

    getStatusValue(dossier: any): string {
        if (dossier.validationUab === true) { return 'VALIDEE_UAB'; }
        if (dossier.validationUab === false) { return 'REJETEE_UAB'; }
        return 'EN_ATTENTE';
    }

    getStatusLabel(dossier: any): string {
        const statut = this.getStatusValue(dossier);
        const labels: { [key: string]: string } = {
            EN_ATTENTE: 'En attente',
            VALIDEE_UAB: 'Validé UAB',
            REJETEE_UAB: 'Rejeté'
        };
        return labels[statut] || 'En attente';
    }

    getStatusClass(dossier: any): string {
        const statut = this.getStatusValue(dossier);
        const classes: { [key: string]: string } = {
            EN_ATTENTE: 'status-warning',
            VALIDEE_UAB: 'status-success',
            REJETEE_UAB: 'status-danger'
        };
        return classes[statut] || 'status-warning';
    }

    getStatusIcon(dossier: any): string {
        const statut = this.getStatusValue(dossier);
        const icons: { [key: string]: string } = {
            EN_ATTENTE: 'pi pi-clock',
            VALIDEE_UAB: 'pi pi-check-circle',
            REJETEE_UAB: 'pi pi-times-circle'
        };
        return icons[statut] || 'pi pi-question-circle';
    }

    // ==================== STATISTIQUES AVEC MONTANTS ====================

    getStatutCount(statutValue: string): number {
        return this.filteredDossiers.filter(d => this.getStatusValue(d) === statutValue).length;
    }

    getMontantRemboursableParStatut(statutValue: string): number {
        const dossiers = this.filteredDossiers.filter(d => this.getStatusValue(d) === statutValue);
        return dossiers.reduce((total, d) => total + (d.montantPrisEnCharge || 0), 0);
    }

    getMontantTotalRemboursable(): number {
        return this.filteredDossiers
            .filter(d => this.getStatusValue(d) === 'VALIDEE_UAB')
            .reduce((total, d) => total + (d.montantPrisEnCharge || 0), 0);
    }

    getMontantTotalEnAttente(): number {
        return this.filteredDossiers
            .filter(d => this.getStatusValue(d) === 'EN_ATTENTE')
            .reduce((total, d) => total + (d.montantPrisEnCharge || 0), 0);
    }

    getMontantTotalRejetes(): number {
        return this.filteredDossiers
            .filter(d => this.getStatusValue(d) === 'REJETEE_UAB')
            .reduce((total, d) => total + (d.montantPrisEnCharge || 0), 0);
    }

    // ==================== MÉTHODES DE TYPE ====================

    getTypeLabel(type: string): string {
        const types: { [key: string]: string } = {
            HOPITAL: 'Hôpital',
            CLINIQUE: 'Clinique',
            PHARMACIE: 'Pharmacie',
            LABORATOIRE: 'Laboratoire',
            CABINET_MEDICAL: 'Cabinet Médical',
            AUTRE: 'Autre'
        };
        return types[type] || type || 'Structure';
    }
    getStructureTypeClass(type: string): string {
        const classes: { [key: string]: string } = {
            HOPITAL: 'type-hopital',
            CLINIQUE: 'type-clinique',
            PHARMACIE: 'type-pharmacie',
            LABORATOIRE: 'type-laboratoire',
            CABINET_MEDICAL: 'type-cabinet'
        };
        return classes[type] || 'type-default';
    }

    getStructureTypeColor(type: string): string {
        const colors: { [key: string]: string } = {
            HOPITAL: '#3b82f6',
            CLINIQUE: '#10b981',
            PHARMACIE: '#f59e0b',
            LABORATOIRE: '#8b5cf6',
            CABINET_MEDICAL: '#ec4899'
        };
        return colors[type] || '#6b7280';
    }

    getTypeClass(dossier: any): string {
        const type = dossier.type;
        const classes: { [key: string]: string } = {
            CONSULTATION: 'type-consultation',
            PRESCRIPTION_MEDICAMENT: 'type-medicament',
            PRESCRIPTION_EXAMEN: 'type-examen'
        };
        return classes[type] || '';
    }

    getTypeIcon(dossier: any): string {
        const type = dossier.type;
        const icons: { [key: string]: string } = {
            CONSULTATION: 'pi pi-folder-open',
            PRESCRIPTION_MEDICAMENT: 'pi pi-tablets',
            PRESCRIPTION_EXAMEN: 'pi pi-microscope'
        };
        return icons[type] || 'pi pi-file';
    }

    getTypeIconByValue(typeValue: string): string {
        const icons: { [key: string]: string } = {
            CONSULTATION: 'pi pi-folder-open',
            PRESCRIPTION_MEDICAMENT: 'pi pi-tablets',
            PRESCRIPTION_EXAMEN: 'pi pi-microscope'
        };
        return icons[typeValue] || 'pi pi-file';
    }

    // ==================== MÉTHODES DE FILTRES ====================

    hasActiveFilters(): boolean {
        return !!(this.searchPolice || this.selectedTypeDossier || this.selectedStructureId ||
            this.selectedStatut || this.dateDebut || this.dateFin);
    }

    getFiltresActifsMessage(): string {
        const messages: string[] = [];
        if (this.searchPolice) { messages.push(`Police: ${this.searchPolice}`); }
        if (this.selectedTypeDossier) { messages.push(`Type: ${this.getTypeLabel(this.selectedTypeDossier)}`); }
        if (this.selectedStructureId) {
            const structure = this.structures.find(s => s.id === this.selectedStructureId);
            if (structure) { messages.push(`Structure: ${structure.nom}`); }
        }
        if (this.selectedStatut) { messages.push(`Statut: ${this.getStatusLabelByValue(this.selectedStatut)}`); }

        // ✅ Afficher le filtre mois
        if (this.selectedMois && this.selectedNomMois) {
            messages.push(`Mois: ${this.selectedNomMois} ${this.selectedAnnee}`);
        }

        if (this.dateDebut && !this.selectedMois) { messages.push(`À partir du: ${this.formatDate(this.dateDebut)}`); }
        if (this.dateFin && !this.selectedMois) { messages.push(`Jusqu'au: ${this.formatDate(this.dateFin)}`); }
        return messages.join(' • ');
    }

    resetMoisFilter(): void {
        this.selectedMois = null;
        this.selectedAnnee = null;
        this.selectedNomMois = '';
        this.applyFilters();
    }

    getStatusLabelByValue(statutValue: string): string {
        const statut = this.statuts.find(s => s.value === statutValue);
        return statut ? statut.label : statutValue;
    }

    // ==================== VALIDATION ====================

    canValidate(dossier: any): boolean {
        const statut = this.getStatusValue(dossier);
        return statut === 'EN_ATTENTE';
    }

    validerRapidement(dossier: any): void {
        this.selectedDossier = dossier;
        this.displayValidationDialog = true;
    }

    confirmerValidation(): void {
        if (!this.selectedDossier) { return; }

        this.loading = true;
        this.uabService.validerDossier(this.selectedDossier.id, this.selectedDossier.type).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Dossier ${this.getTypeLabel(this.selectedDossier.type)} validé avec succès`
                });
                this.displayValidationDialog = false;
                this.loadDossiers(); // Recharger la liste
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                console.error('Erreur validation:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de la validation'
                });
            }
        });
    }

    // ==================== NAVIGATION ====================

    voirDossier(dossier: any): void {
        console.log('UAB - Navigation vers validation:', dossier.id, dossier.type);
        this.router.navigate(['/uab/validation', dossier.id], {
            queryParams: { type: dossier.type }
        });
    }

    // ==================== EXPORT ====================

    exportToExcel(): void {
        const data = this.filteredDossiers.map(d => ({
            Date: d.dateConsultation || d.dateCreation,
            Patient: `${d.patientPrenom || ''} ${d.patientNom || ''}`,
            Police: d.patientPolice || d.numeroPolice,
            CODEINTE: d.codeInte,
            CODERISQ: d.codeRisq,
            Structure: d.structureNom,
            Type: this.getTypeLabel(d.type),
            'Montant Total': d.montantTotalHospitalier || d.montantTotal,
            'Pris en charge UAB': d.montantPrisEnCharge,
            'Ticket modérateur': d.montantTicketModerateur,
            Statut: this.getStatusLabel(d)
        }));

        if (data.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune donnée à exporter'
            });
            return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [];
        csvRows.push(headers.join(','));
        for (const row of data) {
            const values = headers.map(header => {
                let val = row[header as keyof typeof row];
                if (val === undefined || val === null) { val = ''; }
                return `"${String(val).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }

        const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dossiers_uab_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.messageService.add({
            severity: 'success',
            summary: 'Export réussi',
            detail: `${data.length} dossiers exportés`
        });
    }

    exportToExcelXLSX(): void {
        this.exportToExcel();
    }

    // ==================== UTILITAIRES ====================

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // ✅ Nettoyage des subscriptions
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
