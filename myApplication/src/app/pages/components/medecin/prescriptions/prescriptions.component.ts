import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Medicament } from '../../../models/medicament';
import { Examen } from '../../../models/examen';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConsultationService } from '../../../services/consultation/consultation.service';
import { Consultation } from '../../../models/consultation';
import { MedicamentService } from '../../../services/medicament/medicament.service';
import { ExamenService } from '../../../services/examen/examen.service';
import { MedecinService } from '../../../services/medecin/medecin.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-prescriptions',
    templateUrl: './prescriptions.component.html',
    styleUrls: ['./prescriptions.component.scss']
})
export class PrescriptionsComponent implements OnInit, OnDestroy {

    consultationId: number;
    consultation: Consultation | null = null;
    prescriptionForm: FormGroup;
    loading = false;
    submitting = false;

    // Pour les autocomplétions
    filteredMedicaments: Medicament[] = [];
    filteredExamens: Examen[] = [];

    // Pour les recherches avec debounce
    private medicamentSearchSubject = new Subject<{ query: string; index: number }>();
    private examenSearchSubject = new Subject<{ query: string; index: number }>();
    private destroy$ = new Subject<void>();

    activeMedicamentIndex = -1;
    activeExamenIndex = -1;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        public router: Router,
        private consultationService: ConsultationService,
        private medecinService: MedecinService,
        private confirmationService: ConfirmationService,
        private medicamentService: MedicamentService,
        private examenService: ExamenService,
        private messageService: MessageService
    ) {
        this.consultationId = +this.route.snapshot.params.id;
        this.prescriptionForm = this.fb.group({
            natureMaladie: ['', Validators.required],
            diagnostic: [''],
            actesMedicaux: [''],
            prescriptionsMedicaments: this.fb.array([]),
            prescriptionsExamens: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.loadConsultation();
        this.addMedicament();
        this.addExamen();
        this.setupDebouncedSearch();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ========== GETTERS ==========

    get medicamentsArray(): FormArray {
        return this.prescriptionForm.get('prescriptionsMedicaments') as FormArray;
    }

    get examensArray(): FormArray {
        return this.prescriptionForm.get('prescriptionsExamens') as FormArray;
    }

    // ========== GESTION DES LIGNES ==========

    addMedicament(): void {
        this.medicamentsArray.push(this.fb.group({
            medicamentId: [null],
            medicamentNom: ['', Validators.required],
            dosage: [''],
            forme: [''],
            quantitePrescitee: [1, [Validators.required, Validators.min(1)]],
            instructions: ['']
        }));
    }

    addExamen(): void {
        this.examensArray.push(this.fb.group({
            examenId: [null],
            examenNom: ['', Validators.required],
            codeActe: [''],
            instructions: ['']
        }));
    }

    removeMedicament(index: number): void {
        if (this.medicamentsArray.length === 1) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Vous devez conserver au moins une ligne de médicament'
            });
            return;
        }
        this.medicamentsArray.removeAt(index);
    }

    removeExamen(index: number): void {
        if (this.examensArray.length === 1) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Vous devez conserver au moins une ligne d\'examen'
            });
            return;
        }
        this.examensArray.removeAt(index);
    }

    // ========== CHARGEMENT CONSULTATION ==========

    loadConsultation(): void {
        this.loading = true;
        this.consultationService.getById(this.consultationId).subscribe({
            next: (data) => {
                this.consultation = data;
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                console.error('Erreur chargement consultation:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger la consultation'
                });
                this.router.navigate(['/medecin/consultations-attente']);
            }
        });
    }

    // ========== RECHERCHE AVEC DEBOUNCE ==========

    private setupDebouncedSearch(): void {
        // Recherche médicaments avec debounce
        this.medicamentSearchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged((a, b) => a.query === b.query && a.index === b.index),
            switchMap(({ query, index }) => {
                this.activeMedicamentIndex = index;
                if (query && query.length >= 2) {
                    return this.medicamentService.search(query);
                }
                return [];
            }),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (data) => {
                this.filteredMedicaments = data;
            },
            error: (err) => {
                console.error('Erreur recherche médicaments:', err);
                this.filteredMedicaments = [];
            }
        });

        // Recherche examens avec debounce
        this.examenSearchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged((a, b) => a.query === b.query && a.index === b.index),
            switchMap(({ query, index }) => {
                this.activeExamenIndex = index;
                if (query && query.length >= 2) {
                    return this.examenService.search(query);
                }
                return [];
            }),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (data) => {
                this.filteredExamens = data;
            },
            error: (err) => {
                console.error('Erreur recherche examens:', err);
                this.filteredExamens = [];
            }
        });
    }

    searchMedicament(event: any, index: number): void {
        const query = event.target.value;
        this.medicamentSearchSubject.next({ query, index });
    }

    searchExamen(event: any, index: number): void {
        const query = event.target.value;
        this.examenSearchSubject.next({ query, index });
    }

    // ========== SÉLECTION MÉDICAMENTS ==========

    selectMedicament(medicament: Medicament, index: number): void {
        // Vérifier si l'index est valide
        if (index < 0 || index >= this.medicamentsArray.length) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de sélectionner ce médicament'
            });
            return;
        }

        // Vérifier l'exclusion
        if (medicament.exclusion === 'OUI') {
            this.messageService.add({
                severity: 'error',
                summary: 'Médicament exclu',
                detail: `Le médicament "${medicament.nom}" est exclu de la prise en charge par UAB ASSURANCES.`,
                life: 5000
            });
            // Réinitialiser le champ
            const group = this.medicamentsArray.at(index) as FormGroup;
            group.patchValue({
                medicamentNom: '',
                medicamentId: null
            });
            return;
        }

        const group = this.medicamentsArray.at(index) as FormGroup;
        group.patchValue({
            medicamentId: medicament.id,
            medicamentNom: medicament.nom,
            dosage: medicament.dosage || '',
            forme: medicament.forme || ''
        });

        // Nettoyer la liste déroulante
        this.clearMedicamentDropdown();

        this.messageService.add({
            severity: 'success',
            summary: 'Médicament sélectionné',
            detail: medicament.nom,
            life: 2000
        });
    }

    createAndSelectMedicament(medicamentName: string, index: number): void {
        if (!medicamentName || medicamentName.trim() === '') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez saisir le nom du médicament'
            });
            return;
        }

        this.loading = true;
        const newMedicament = {
            nom: medicamentName.trim(),
            dosage: '',
            forme: '',
            actif: true
        };

        this.medicamentService.create(newMedicament).subscribe({
            next: (medicament) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Médicament "${medicament.nom}" ajouté au référentiel`
                });
                this.selectMedicament(medicament, index);
            },
            error: (err) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: err.error?.message || 'Erreur lors de la création du médicament'
                });
            }
        });
    }

    // ========== SÉLECTION EXAMENS ==========

    selectExamen(examen: Examen, index: number): void {
        const group = this.examensArray.at(index) as FormGroup;

        // Si l'examen nécessite une validation UAB
        if (examen.validation === 'OUI') {
            this.confirmationService.confirm({
                message: `L'examen "${examen.nom}" nécessite une autorisation de l'UAB avant d'être réalisé.\n\nUne demande d'autorisation sera envoyée à l'UAB pour validation.\n\nVoulez-vous continuer ?`,
                header: 'Demande d\'autorisation UAB',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Oui, faire la demande',
                rejectLabel: 'Annuler',
                accept: () => {
                    group.patchValue({
                        examenId: examen.id,
                        examenNom: examen.nom,
                        codeActe: examen.code
                    });
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Demande envoyée',
                        detail: `Une demande d'autorisation pour "${examen.nom}" a été envoyée à l'UAB.`,
                        life: 5000
                    });
                },
                reject: () => {
                    group.patchValue({ examenNom: '' });
                }
            });
        } else {
            group.patchValue({
                examenId: examen.id,
                examenNom: examen.nom,
                codeActe: examen.code
            });
            this.messageService.add({
                severity: 'success',
                summary: 'Examen sélectionné',
                detail: examen.nom,
                life: 2000
            });
        }

        // Nettoyer la liste déroulante
        this.clearExamenDropdown();
    }

    createAndSelectExamen(examenName: string, index: number): void {
        if (!examenName || examenName.trim() === '') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez saisir le nom de l\'examen'
            });
            return;
        }

        this.loading = true;
        this.examenService.create({ nom: examenName.trim() }).subscribe({
            next: (examen) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Examen "${examen.nom}" ajouté au référentiel`
                });
                this.selectExamen(examen, index);
            },
            error: (err) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: err.error?.message || 'Erreur lors de la création de l\'examen'
                });
            }
        });
    }

    // ========== NETTOYAGE DROPDOWNS ==========

    clearMedicamentDropdown(): void {
        setTimeout(() => {
            this.filteredMedicaments = [];
            this.activeMedicamentIndex = -1;
        }, 200);
    }

    clearExamenDropdown(): void {
        setTimeout(() => {
            this.filteredExamens = [];
            this.activeExamenIndex = -1;
        }, 200);
    }

    // ========== VALIDATION FORMULAIRE ==========

    private isFormValid(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (this.prescriptionForm.get('natureMaladie')?.invalid) {
            errors.push('Nature de la maladie');
        }

        // Vérifier les médicaments
        const medicaments = this.medicamentsArray;
        for (let i = 0; i < medicaments.length; i++) {
            const medGroup = medicaments.at(i) as FormGroup;
            if (!medGroup.get('medicamentNom')?.value) {
                errors.push(`Médicament ${i + 1} (nom requis)`);
            }
            const quantite = medGroup.get('quantitePrescitee')?.value;
            if (!quantite || quantite < 1) {
                errors.push(`Médicament ${i + 1} (quantité valide requise)`);
            }
        }

        // Vérifier les examens
        const examens = this.examensArray;
        for (let i = 0; i < examens.length; i++) {
            const examGroup = examens.at(i) as FormGroup;
            if (!examGroup.get('examenNom')?.value) {
                errors.push(`Examen ${i + 1} (nom requis)`);
            }
        }

        return { valid: errors.length === 0, errors };
    }

    private hasAnyPrescription(): boolean {
        const hasMedicaments = this.medicamentsArray.controls.some(m => m.get('medicamentNom')?.value);
        const hasExamens = this.examensArray.controls.some(e => e.get('examenNom')?.value);
        return hasMedicaments || hasExamens;
    }

    // ========== SOUMISSION ==========

    confirmerEtSoumettre(): void {
        const formValue = this.prescriptionForm.value;
        const nbMedicaments = formValue.prescriptionsMedicaments?.filter((m: any) => m.medicamentNom).length || 0;
        const nbExamens = formValue.prescriptionsExamens?.filter((e: any) => e.examenNom).length || 0;

        if (nbMedicaments === 0 && nbExamens === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Aucune prescription',
                detail: 'Veuillez ajouter au moins un médicament ou un examen avant de soumettre',
                life: 4000
            });
            return;
        }

        let message = `Voulez-vous vraiment enregistrer ces prescriptions ?\n\n`;
        if (nbMedicaments > 0) {
            message += `💊 ${nbMedicaments} médicament(s)\n`;
        }
        if (nbExamens > 0) {
            message += `🔬 ${nbExamens} examen(s)\n\n`;
        }
        message += `Patient: ${this.consultation?.prenomPatient} ${this.consultation?.nomPatient}`;

        this.confirmationService.confirm({
            message,
            header: 'Confirmation d\'enregistrement',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Oui, enregistrer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.onSubmit();
            }
        });
    }

    onSubmit(): void {
        // 1. Vérifier si déjà en cours de soumission
        if (this.submitting) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ En cours',
                detail: 'Un enregistrement est déjà en cours, veuillez patienter...',
                life: 3000
            });
            return;
        }

        // 2. Vérifier la validité du formulaire
        const { valid, errors } = this.isFormValid();
        if (!valid) {
            this.messageService.add({
                severity: 'error',
                summary: '❌ Formulaire incomplet',
                detail: `Veuillez remplir les champs suivants: ${errors.join(', ')}`,
                life: 5000
            });
            return;
        }

        // 3. Vérifier qu'il y a au moins une prescription
        if (!this.hasAnyPrescription()) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Aucune prescription',
                detail: 'Veuillez ajouter au moins un médicament ou un examen',
                life: 4000
            });
            return;
        }

        this.submitting = true;
        const formValue = this.prescriptionForm.value;

        // Compter pour le message de succès
        const nbMedicaments = formValue.prescriptionsMedicaments?.filter((m: any) => m.medicamentNom).length || 0;
        const nbExamens = formValue.prescriptionsExamens?.filter((e: any) => e.examenNom).length || 0;

        this.consultationService.addPrescriptions(this.consultationId, formValue).subscribe({
            next: (response) => {
                this.submitting = false;

                // ✅ MESSAGE DE SUCCÈS DÉTAILLÉ
                let successMessage = '';
                if (nbMedicaments > 0 && nbExamens > 0) {
                    successMessage = `${nbMedicaments} médicament(s) et ${nbExamens} examen(s) prescrits avec succès`;
                } else if (nbMedicaments > 0) {
                    successMessage = `${nbMedicaments} médicament(s) prescrit(s) avec succès`;
                } else if (nbExamens > 0) {
                    successMessage = `${nbExamens} examen(s) prescrit(s) avec succès`;
                }

                this.messageService.add({
                    severity: 'success',
                    summary: '✅ Prescriptions enregistrées',
                    detail: successMessage,
                    life: 5000
                });

                // Notification supplémentaire pour les examens avec validation UAB
                const examensAvecValidation = formValue.prescriptionsExamens?.filter((e: any) => {
                    const examen = this.filteredExamens.find(ex => ex.nom === e.examenNom);
                    return examen?.validation === 'OUI';
                }) || [];

                if (examensAvecValidation.length > 0) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'info',
                            summary: '📋 Demande d\'autorisation',
                            detail: `${examensAvecValidation.length} examen(s) nécessitent une validation par l'UAB. Vous serez notifié de la décision.`,
                            life: 7000
                        });
                    }, 500);
                }

                // Redirection après succès
                setTimeout(() => {
                    this.router.navigate(['/medecin/consultations-attente']);
                }, 1500);
            },
            error: (error) => {
                this.submitting = false;

                // ✅ Gestion TRÈS DÉTAILLÉE des erreurs
                let errorTitle = '❌ Erreur';
                let errorMessage = 'Une erreur est survenue lors de l\'enregistrement';
                let errorDetail = '';

                // Analyse détaillée de l'erreur
                if (error.error) {
                    // Cas 1: Message d'erreur personnalisé du backend
                    if (typeof error.error === 'string') {
                        errorMessage = error.error;
                    } else if (error.error.message) {
                        errorMessage = error.error.message;
                        if (error.error.detail) { errorDetail = error.error.detail; }
                    } else if (error.error.error) {
                        errorMessage = error.error.error;
                    }

                    // Cas 2: Erreurs de validation (champs spécifiques)
                    if (error.error.errors) {
                        const validationErrors = Object.values(error.error.errors).join(', ');
                        errorMessage = `Validation échouée: ${validationErrors}`;
                        errorTitle = '❌ Erreur de validation';
                    }
                }

                // Cas 3: Erreurs HTTP
                switch (error.status) {
                    case 0:
                        errorTitle = '🔌 Erreur de connexion';
                        errorMessage = 'Impossible de contacter le serveur.';
                        errorDetail = 'Vérifiez que le backend est démarré (npm start) et que vous êtes connecté au réseau.';
                        break;
                    case 401:
                        errorTitle = '🔒 Session expirée';
                        errorMessage = 'Votre session a expiré.';
                        errorDetail = 'Veuillez vous reconnecter pour continuer.';
                        // Déconnexion automatique
                        setTimeout(() => this.router.navigate(['/login']), 3000);
                        break;
                    case 403:
                        errorTitle = '⛔ Accès refusé';
                        errorMessage = 'Vous n\'avez pas les droits pour effectuer cette action.';
                        errorDetail = 'Seuls les médecins peuvent prescrire des médicaments et examens.';
                        break;
                    case 404:
                        errorTitle = '🔍 Consultation introuvable';
                        errorMessage = 'La consultation n\'existe pas ou a été supprimée.';
                        errorDetail = 'Veuillez rafraîchir la page et réessayer.';
                        setTimeout(() => this.router.navigate(['/medecin/consultations-attente']), 3000);
                        break;
                    case 409:
                        errorTitle = '⚠️ Conflit';
                        errorMessage = 'Des prescriptions existent déjà pour cette consultation.';
                        errorDetail = 'Vous ne pouvez pas ajouter de nouvelles prescriptions.';
                        setTimeout(() => this.router.navigate(['/medecin/consultations-attente']), 3000);
                        break;
                    case 422:
                        errorTitle = '📝 Données invalides';
                        errorMessage = 'Les données envoyées sont incomplètes ou invalides.';
                        errorDetail = 'Vérifiez que tous les champs sont correctement remplis.';
                        break;
                    case 500:
                        errorTitle = '💥 Erreur serveur';
                        errorMessage = 'Une erreur interne est survenue sur le serveur.';
                        errorDetail = 'Veuillez réessayer plus tard ou contacter l\'administrateur.';
                        break;
                    default:
                        if (error.status && error.status >= 400 && error.status < 500) {
                            errorTitle = '📝 Erreur client';
                            errorMessage = errorMessage || 'Les données envoyées sont incorrectes.';
                        } else if (error.status && error.status >= 500) {
                            errorTitle = '💥 Erreur serveur';
                            errorMessage = errorMessage || 'Le serveur a rencontré une erreur.';
                        }
                }

                // Messages spécifiques selon le contenu
                if (errorMessage.toLowerCase().includes('médicament') && errorMessage.toLowerCase().includes('exclu')) {
                    errorTitle = '🚫 Médicament exclu';
                    errorMessage = 'Un ou plusieurs médicaments sélectionnés sont exclus.';
                    errorDetail = 'Les médicaments avec exclusion "OUI" ne peuvent pas être prescrits.';
                } else if (errorMessage.toLowerCase().includes('quantité') || errorMessage.toLowerCase().includes('quantite')) {
                    errorTitle = '🔢 Quantité invalide';
                    errorMessage = 'La quantité prescrite n\'est pas valide.';
                    errorDetail = 'La quantité doit être un nombre supérieur à 0.';
                } else if (errorMessage.toLowerCase().includes('examen') && errorMessage.toLowerCase().includes('validation')) {
                    errorTitle = '⏳ Validation requise';
                    errorMessage = 'Cet examen nécessite une validation UAB.';
                    errorDetail = 'La demande d\'autorisation a été envoyée automatiquement.';
                }

                // Affichage du message d'erreur détaillé
                this.messageService.add({
                    severity: 'error',
                    summary: errorTitle,
                    detail: errorMessage,
                    life: 8000
                });

                // Affichage du détail supplémentaire si disponible
                if (errorDetail) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'ℹ️ Détail',
                            detail: errorDetail,
                            life: 6000
                        });
                    }, 500);
                }

                // Log de l'erreur complète pour le debug
                console.error('=== ERREUR DÉTAILLÉE ===');
                console.error('Status:', error.status);
                console.error('Message:', error.message);
                console.error('Error object:', error.error);
            }
        });
    }
}
