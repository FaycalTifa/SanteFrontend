import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Medicament } from '../../../models/medicament';
import { Examen } from '../../../models/examen';
import { MessageService } from 'primeng/api';
import { ConsultationService } from '../../../services/consultation/consultation.service';
import { Consultation } from '../../../models/consultation';
import { MedicamentService } from '../../../services/medicament/medicament.service';
import { ExamenService } from '../../../services/examen/examen.service';
import { MedecinService } from '../../../services/medecin/medecin.service';

@Component({
    selector: 'app-prescriptions',
    templateUrl: './prescriptions.component.html',
    styleUrls: ['./prescriptions.component.scss']
})
export class PrescriptionsComponent implements OnInit {

    consultationId: number;
    consultation: any = null;
    prescriptionForm: FormGroup;
    loading = false;

    // Pour les autocomplétions
    filteredMedicaments: Medicament[] = [];
    filteredExamens: Examen[] = [];

    // Pour la création rapide
    showNewMedicamentDialog = false;
    showNewExamenDialog = false;
    newMedicament: Partial<Medicament> = { nom: '', dosage: '', forme: '' };
    newExamen: Partial<Examen> = { nom: '', code: '', categorie: 'ANALYSE' };

    activeMedicamentIndex = -1;
    activeExamenIndex = -1;

    // Pour la recherche
    medicamentSearchTimeout: any;
    examenSearchTimeout: any;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        public router: Router,
        private consultationService: ConsultationService,
        private medecinService: MedecinService,
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
        this.addMedicament(); // Ajouter une ligne vide par défaut
        this.addExamen(); // Ajouter une ligne vide par défaut
    }



    get medicamentsArray(): FormArray {
        return this.prescriptionForm.get('prescriptionsMedicaments') as FormArray;
    }

    get examensArray(): FormArray {
        return this.prescriptionForm.get('prescriptionsExamens') as FormArray;
    }

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
        this.medicamentsArray.removeAt(index);
    }

    removeExamen(index: number): void {
        this.examensArray.removeAt(index);
    }

    loadConsultation(): void {
        this.loading = true;
        this.consultationService.getById(this.consultationId).subscribe({
            next: (data) => {
                this.consultation = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger la consultation'
                });
                this.router.navigate(['/medecin/consultations-attente']);
            }
        });
    }

    // ========== AUTOCOMPLETE MÉDICAMENTS AVEC CRÉATION AUTO ==========
    searchMedicament(event: any, index: number): void {
        const query = event.target.value;
        this.activeMedicamentIndex = index;

        if (query && query.length >= 2) {
            this.medicamentService.search(query).subscribe({  // ✅ Utilisez search() au lieu de searchMedicaments()
                next: (data) => {
                    this.filteredMedicaments = data;
                },
                error: (err) => {
                    console.error('Erreur recherche médicaments:', err);
                    this.filteredMedicaments = [];
                }
            });
        } else {
            this.filteredMedicaments = [];
        }
    }

    selectMedicament(medicament: Medicament, index: number): void {
        const group = this.medicamentsArray.at(index) as FormGroup;
        group.patchValue({
            medicamentId: medicament.id,
            medicamentNom: medicament.nom,
            dosage: medicament.dosage,
            forme: medicament.forme
        });
        this.filteredMedicaments = [];
        this.activeMedicamentIndex = -1;
    }

    // ✅ Création automatique d'un médicament s'il n'existe pas
// Pour la création de médicament - Version corrigée
    createAndSelectMedicament(medicamentName: string, index: number): void {
        if (!medicamentName || medicamentName.trim() === '') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez saisir le nom du médicament'
            });
            return;
        }

        // ✅ Créer un objet médicament complet
        const newMedicament = {
            nom: medicamentName.trim(),
            dosage: '',
            forme: '',
            actif: true
        };

        this.medicamentService.create(newMedicament).subscribe({
            next: (medicament) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Médicament "${medicament.nom}" ajouté au référentiel`
                });
                this.selectMedicament(medicament, index);
            },
            error: (err) => {
                console.error('Erreur création médicament:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: err.error?.message || 'Erreur lors de la création'
                });
            }
        });
    }

    // ========== AUTOCOMPLETE EXAMENS AVEC CRÉATION AUTO ==========
    searchExamen(event: any, index: number): void {
        const query = event.target.value;
        this.activeExamenIndex = index;

        if (query && query.length >= 2) {
            this.examenService.search(query).subscribe({  // ✅ Utilisez search() au lieu de searchExamens()
                next: (data) => {
                    this.filteredExamens = data;
                },
                error: (err) => {
                    console.error('Erreur recherche examens:', err);
                    this.filteredExamens = [];
                }
            });
        } else {
            this.filteredExamens = [];
        }
    }
    selectExamen(examen: Examen, index: number): void {
        const group = this.examensArray.at(index) as FormGroup;
        group.patchValue({
            examenId: examen.id,
            examenNom: examen.nom,
            codeActe: examen.code
        });
        this.filteredExamens = [];
        this.activeExamenIndex = -1;
    }

    // ✅ Création automatique d'un examen s'il n'existe pas
    createAndSelectExamen(examenName: string, index: number): void {
        if (!examenName || examenName.trim() === '') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez saisir le nom de l\'examen'
            });
            return;
        }

        this.examenService.create({ nom: examenName.trim() }).subscribe({  // ✅ Utilisez create() au lieu de createExamen()
            next: (examen) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Examen "${examen.nom}" ajouté au référentiel`
                });
                this.selectExamen(examen, index);
            },
            error: (err) => {
                console.error('Erreur création examen:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: err.error?.message || 'Erreur lors de la création'
                });
            }
        });
    }

    onSubmit(): void {
        if (this.prescriptionForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez remplir tous les champs obligatoires'
            });
            return;
        }

        this.loading = true;
        this.consultationService.addPrescriptions(this.consultationId, this.prescriptionForm.value).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Prescriptions enregistrées avec succès'
                });
                this.router.navigate(['/medecin/consultations-attente']);
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de l\'enregistrement'
                });
            }
        });
    }
}
