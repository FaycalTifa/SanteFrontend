// pages/components/uab/validation-examens/validation-examens.component.ts
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import {PrescriptionExamen} from "../../../models/prescription";
import {ValidationExamenService} from "../../../services/validationExamen/validation-examen.service";

@Component({
    selector: 'app-validation-examens',
    templateUrl: './validation-examens.component.html',
    styleUrls: ['./validation-examens.component.scss']
})
export class ValidationExamensComponent implements OnInit {

    examens: PrescriptionExamen[] = [];
    filteredExamens: PrescriptionExamen[] = [];
    loading = false;

    selectedExamen: PrescriptionExamen | null = null;
    motifRejet = '';
    showRejetDialog = false;

    constructor(
        private validationExamenService: ValidationExamenService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadExamens();
    }

    loadExamens(): void {
        this.loading = true;
        this.validationExamenService.getExamensEnAttenteValidation().subscribe({
            next: (data) => {
                this.examens = data;
                this.filteredExamens = data;
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les examens'
                });
            }
        });
    }

    valider(examen: PrescriptionExamen): void {
        this.validationExamenService.validerExamen(examen.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Examen "${examen.examenNom}" validé avec succès`
                });
                this.loadExamens();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de la validation'
                });
            }
        });
    }

    ouvrirRejet(examen: PrescriptionExamen): void {
        this.selectedExamen = examen;
        this.motifRejet = '';
        this.showRejetDialog = true;
    }

    confirmerRejet(): void {
        if (!this.motifRejet.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez saisir un motif de rejet'
            });
            return;
        }

        this.validationExamenService.rejeterExamen(this.selectedExamen!.id, this.motifRejet).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Examen "${this.selectedExamen?.examenNom}" rejeté`
                });
                this.showRejetDialog = false;
                this.loadExamens();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors du rejet'
                });
            }
        });
    }
}
