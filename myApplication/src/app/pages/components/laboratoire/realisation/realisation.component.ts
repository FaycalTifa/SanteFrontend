import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LaboratoireService } from '../../../services/laboratoire/laboratoire.service';
import { MessageService } from 'primeng/api';
import { PrescriptionExamen } from '../../../models/prescription';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
    selector: 'app-realisation',
    templateUrl: './realisation.component.html',
    styleUrls: ['./realisation.component.scss']
})
export class RealisationComponent implements OnInit {

    examenId: number;
    examen: PrescriptionExamen | null = null;
    realisationForm: FormGroup;
    loading = false;
    isAlreadyRealised = false;  // ✅ Pour savoir si l'examen est déjà réalisé

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        public router: Router,
        private laboratoireService: LaboratoireService,
        private messageService: MessageService,
        private authService: AuthService
    ) {
        this.examenId = +this.route.snapshot.params.id;
        this.realisationForm = this.fb.group({
            // ✅ Supprimer prixTotal du formulaire - il sera affiché depuis l'examen
            resultats: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.loadExamen();
    }

    get resultatsArray(): FormArray {
        return this.realisationForm.get('resultats') as FormArray;
    }

    addResultat(): void {
        this.resultatsArray.push(this.fb.group({
            parametre: ['', Validators.required],
            valeur: ['', Validators.required],
            unite: [''],
            valeurNormaleMin: [''],
            valeurNormaleMax: ['']
        }));
    }

    removeResultat(index: number): void {
        this.resultatsArray.removeAt(index);
    }

    loadExamen(): void {
        this.loading = true;
        this.laboratoireService.getExamenById(this.examenId).subscribe({
            next: (data) => {
                this.examen = data;
                this.isAlreadyRealised = data.realise === true;

                console.log('=== EXAMEN CHARGÉ ===');
                console.log('ID:', data.id);
                console.log('Réalisé:', data.realise);
                console.log('Prix total:', data.prixTotal);
                console.log('Ticket modérateur:', data.montantTicketModerateur);

                this.loading = false;

                // ✅ Si déjà réalisé, désactiver tout le formulaire
                if (this.isAlreadyRealised) {
                    this.realisationForm.disable();
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Information',
                        detail: 'Cet examen a déjà été réalisé'
                    });
                }
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger l\'examen'
                });
                this.router.navigate(['/laboratoire/examens-attente']);
            }
        });
    }

    onSubmit(): void {
        if (this.isAlreadyRealised) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Cet examen a déjà été réalisé'
            });
            return;
        }

        if (this.realisationForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez ajouter au moins un résultat'
            });
            return;
        }

        if (this.resultatsArray.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez ajouter au moins un résultat'
            });
            return;
        }

        this.loading = true;

        // ✅ Envoyer uniquement les résultats (le prix est déjà connu)
        const request = {
            prescriptionId: this.examenId,
            resultats: this.realisationForm.get('resultats')?.value
        };

        console.log('Requête de réalisation:', request);

        this.laboratoireService.realiserExamen(request).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Examen réalisé avec succès'
                });
                this.router.navigate(['/laboratoire/examens-attente']);
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de la réalisation'
                });
            }
        });
    }
}
