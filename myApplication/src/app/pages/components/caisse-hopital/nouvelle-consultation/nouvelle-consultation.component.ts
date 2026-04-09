import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConsultationService } from '../../../services/consultation/consultation.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth/auth.service';
import { TauxCouverture } from '../../../models/TauxCouverture';
import { TauxCouvertureService } from '../../../services/TauxCouverture/taux-couverture.service';
import { AssureService } from '../../../services/assure/assure.service';

@Component({
    selector: 'app-nouvelle-consultation',
    templateUrl: './nouvelle-consultation.component.html',
    styleUrls: ['./nouvelle-consultation.component.scss']
})
export class NouvelleConsultationComponent implements OnInit {

    consultationForm: FormGroup;
    loading = false;

    tauxDisponibles: TauxCouverture[] = [];
    tauxSelectionne: TauxCouverture | null = null;

    montantPrisEnCharge = 0;
    montantTicketModerateur = 0;

    // Pour la recherche patient
    patientTrouve: any = null;
    patientNonTrouve = false;
    recherchePatientEnCours = false;

    constructor(
        private fb: FormBuilder,
        private consultationService: ConsultationService,
        private tauxService: TauxCouvertureService,
        private assureService: AssureService,
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {
        this.consultationForm = this.fb.group({
            numeroPolice: ['', [Validators.required]],
            nomPatient: ['', [Validators.required]],
            prenomPatient: ['', [Validators.required]],
            telephonePatient: [''],
            dateNaissance: [''],
            dateConsultation: [new Date(), [Validators.required]],
            prixConsultation: [0, [Validators.required, Validators.min(0)]],
            prixActes: [0, [Validators.min(0)]],
            tauxId: [null, [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.loadTauxDisponibles();

        // Écouter les changements de taux
        this.consultationForm.get('tauxId')?.valueChanges.subscribe(tauxId => {
            this.tauxSelectionne = this.tauxDisponibles.find(t => t.id === tauxId) || null;
            this.calculerMontants();
        });

        // Écouter les changements de prix
        this.consultationForm.get('prixConsultation')?.valueChanges.subscribe(() => this.calculerMontants());
        this.consultationForm.get('prixActes')?.valueChanges.subscribe(() => this.calculerMontants());
    }

    loadTauxDisponibles(): void {
        this.tauxService.getAllTaux().subscribe({
            next: (taux) => {
                this.tauxDisponibles = taux;
                console.log('Taux disponibles:', this.tauxDisponibles);
            },
            error: (error) => {
                console.error('Erreur chargement taux:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les taux de couverture'
                });
            }
        });
    }

    /**
     * ✅ Rechercher un patient par numéro de police
     */
// nouvelle-consultation.component.ts
    rechercherPatientParPolice(): void {
        const numeroPolice = this.consultationForm.get('numeroPolice')?.value;

        if (this.recherchePatientEnCours) { return; }

        if (numeroPolice && numeroPolice.trim().length > 0) {
            this.recherchePatientEnCours = true;
            this.patientNonTrouve = false;

            this.assureService.rechercherParPolice(numeroPolice).subscribe({
                next: (patient) => {
                    console.log('Patient reçu:', patient);
                    if (patient && patient.id) {
                        this.patientTrouve = patient;
                        this.patientNonTrouve = false;
                        this.consultationForm.patchValue({
                            nomPatient: patient.nom,
                            prenomPatient: patient.prenom,
                            telephonePatient: patient.telephone || '',
                            dateNaissance: patient.dateNaissance ? new Date(patient.dateNaissance) : null
                        });
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Patient trouvé',
                            detail: `Patient: ${patient.prenom} ${patient.nom}`
                        });
                    } else {
                        this.patientTrouve = null;
                        this.patientNonTrouve = true;
                    }
                    this.recherchePatientEnCours = false;
                },
                error: (error) => {
                    console.error('Erreur recherche patient:', error);
                    this.patientTrouve = null;
                    this.patientNonTrouve = true;
                    this.recherchePatientEnCours = false;
                }
            });
        } else {
            this.patientTrouve = null;
            this.patientNonTrouve = false;
        }
    }
    calculerTotal(): number {
        const prixConsultation = this.consultationForm.get('prixConsultation')?.value || 0;
        const prixActes = this.consultationForm.get('prixActes')?.value || 0;
        return prixConsultation + prixActes;
    }

    calculerMontants(): void {
        const total = this.calculerTotal();
        if (this.tauxSelectionne && total > 0) {
            this.montantPrisEnCharge = total * (this.tauxSelectionne.tauxPourcentage / 100);
            this.montantTicketModerateur = total - this.montantPrisEnCharge;
        } else {
            this.montantPrisEnCharge = 0;
            this.montantTicketModerateur = total;
        }
    }

    onSubmit(): void {
        console.log('=== CRÉATION CONSULTATION ===');

        if (this.consultationForm.invalid) {
            Object.keys(this.consultationForm.controls).forEach(key => {
                this.consultationForm.get(key)?.markAsTouched();
            });
            return;
        }

        if (!this.tauxSelectionne) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez sélectionner un taux de couverture'
            });
            return;
        }

        this.loading = true;
        const formValue = this.consultationForm.value;

        const request = {
            numeroPolice: formValue.numeroPolice,
            nomPatient: formValue.nomPatient,
            prenomPatient: formValue.prenomPatient,
            telephonePatient: formValue.telephonePatient,
            dateNaissance: formValue.dateNaissance ? this.formatDate(formValue.dateNaissance) : '',
            dateConsultation: this.formatDate(formValue.dateConsultation),
            prixConsultation: formValue.prixConsultation,
            prixActes: formValue.prixActes,
            tauxId: formValue.tauxId
        };

        this.consultationService.createByCaisse(request).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Consultation créée avec succès. N° Feuille: ${response.numeroFeuille}`
                });
                this.resetForm();
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de la création'
                });
            }
        });
    }

    resetForm(): void {
        this.consultationForm.reset();
        this.consultationForm.patchValue({
            dateConsultation: new Date(),
            prixConsultation: 0,
            prixActes: 0,
            tauxId: null
        });
        this.tauxSelectionne = null;
        this.patientTrouve = null;
        this.patientNonTrouve = false;
        this.montantPrisEnCharge = 0;
        this.montantTicketModerateur = 0;
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
