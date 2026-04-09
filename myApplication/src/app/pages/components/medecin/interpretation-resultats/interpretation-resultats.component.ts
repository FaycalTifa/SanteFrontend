import { Component, OnInit } from '@angular/core';
import { PrescriptionExamen } from '../../../models/prescription';
import { MedecinService } from '../../../services/medecin/medecin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConsultationService } from '../../../services/consultation/consultation.service';

@Component({
    selector: 'app-interpretation-resultats',
    templateUrl: './interpretation-resultats.component.html',
    styleUrls: ['./interpretation-resultats.component.scss']
})
export class InterpretationResultatsComponent implements OnInit {

    examens: PrescriptionExamen[] = [];
    filteredExamens: PrescriptionExamen[] = [];
    loading = false;
    searchPolice = '';
    consultationId: number | null = null;
    selectedExamen: PrescriptionExamen | null = null;
    displayInterpretationDialog = false;
    interpretation = '';

    // Filtres
    filterOptions = [
        { label: '📋 Tous', value: 'all' },
        { label: '⏳ En attente', value: 'pending' },
        { label: '✅ Interprétés', value: 'interpreted' }
    ];
    currentFilter = 'all';

    constructor(
        private medecinService: MedecinService,
        private route: ActivatedRoute,
        private consultationService: ConsultationService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.consultationId = +params['id'];
                console.log('Consultation ID from URL:', this.consultationId);
                this.loadExamensByConsultation();
            } else {
                this.loadAllExamens();
            }
        });
    }

    /**
     * Charger TOUS les examens réalisés
     */
    loadAllExamens(): void {
        this.loading = true;
        this.medecinService.getAllExamensRealises().subscribe({
            next: (data) => {
                console.log('=== TOUS LES EXAMENS REALISÉS ===');
                console.log('Nombre total:', data.length);
                data.forEach(e => {
                    console.log(`Examen ${e.id}: ${e.examenNom} - Interprété: ${!!e.interpretation}`);
                });
                this.examens = data;
                this.applyFilters();
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur chargement examens:', error);
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les examens'
                });
            }
        });
    }

    loadExamensByConsultation(): void {
        if (!this.consultationId) {
            this.loading = false;
            return;
        }

        this.loading = true;
        console.log('Chargement des examens pour consultation ID:', this.consultationId);

        this.medecinService.getExamensRealisesByConsultation(this.consultationId).subscribe({
            next: (data) => {
                console.log('Examens reçus:', data);
                this.examens = data;
                this.applyFilters();
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur chargement examens:', error);
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les examens'
                });
            }
        });
    }

    /**
     * Rechercher par numéro de police
     */
    // interpretation-resultats.component.ts
    rechercher(): void {
        if (this.searchPolice.trim()) {
            this.loading = true;
            this.consultationService.getExamensByPolice(this.searchPolice).subscribe({
                next: (data) => {
                    console.log('=== EXAMENS TROUVÉS ===');
                    console.log('Nombre total:', data.length);

                    // ✅ Filtrer uniquement les examens réalisés
                    const examensRealises = data.filter(e => e.realise === true);
                    console.log('Examens réalisés:', examensRealises.length);

                    this.examens = examensRealises;
                    this.applyFilters();
                    this.loading = false;
                },
                error: (error) => {
                    this.loading = false;
                    console.error('Erreur recherche:', error);
                }
            });
        }
    }

    resetSearch(): void {
        this.searchPolice = '';
        this.currentFilter = 'all';
        if (this.consultationId) {
            this.loadExamensByConsultation();
        } else {
            this.loadAllExamens();
        }
    }

    applyFilters(): void {
        let result = [...this.examens];

        // Filtre par recherche
        if (this.searchPolice.trim()) {
            result = result.filter(e =>
                e.patientPolice?.toLowerCase().includes(this.searchPolice.toLowerCase())
            );
        }

        // Filtre par statut d'interprétation
        if (this.currentFilter === 'interpreted') {
            result = result.filter(e => e.interpretation && e.interpretation.trim() !== '');
        } else if (this.currentFilter === 'pending') {
            result = result.filter(e => !e.interpretation || e.interpretation.trim() === '');
        }

        this.filteredExamens = result;
        console.log(`Filtre appliqué: ${this.currentFilter} - ${this.filteredExamens.length} examens`);
    }

    onFilterChange(value: string): void {
        this.currentFilter = value;
        this.applyFilters();
    }

    ouvrirInterpretation(examen: PrescriptionExamen): void {
        // ✅ Vérifier si déjà interprété
        if (examen.interpretation) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Cet examen a déjà une interprétation'
            });
            return;
        }

        this.selectedExamen = examen;
        this.interpretation = examen.interpretation || '';
        this.displayInterpretationDialog = true;
    }

    fermerDialogue(): void {
        this.displayInterpretationDialog = false;
        this.selectedExamen = null;
        this.interpretation = '';
    }

    sauvegarderInterpretation(): void {
        if (!this.interpretation.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez saisir une interprétation'
            });
            return;
        }

        this.loading = true;
        this.medecinService.ajouterInterpretation(this.selectedExamen!.id, this.interpretation).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: this.selectedExamen?.interpretation ? 'Interprétation modifiée avec succès' : 'Interprétation enregistrée avec succès'
                });
                this.fermerDialogue();
                // Recharger les examens
                if (this.consultationId) {
                    this.loadExamensByConsultation();
                } else if (this.searchPolice.trim()) {
                    this.rechercher();
                } else {
                    this.loadAllExamens();
                }
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                console.error('Erreur sauvegarde:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de l\'enregistrement'
                });
            }
        });
    }

    getResultatsAnormaux(examen: PrescriptionExamen): any[] {
        return examen.resultats?.filter(r => r.anormal) || [];
    }

    // ✅ Vérifier si un examen peut être interprété
    peutInterpreter(examen: PrescriptionExamen): boolean {
        return examen.realise === true && (!examen.interpretation || examen.interpretation.trim() === '');
    }

    // ✅ Vérifier si déjà interprété
    estDejaInterprete(examen: PrescriptionExamen): boolean {
        return examen.interpretation && examen.interpretation.trim() !== '';
    }
}
