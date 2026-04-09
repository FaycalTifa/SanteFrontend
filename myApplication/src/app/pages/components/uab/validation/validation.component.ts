import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Consultation} from '../../../models/consultation';
import {ConsultationService} from '../../../services/consultation/consultation.service';
import {ConfirmationService, MessageService} from 'primeng/api';

@Component({
  selector: 'app-validation',
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.scss']
})
export class ValidationComponent implements OnInit {

    consultationId: number;
    consultation: Consultation | null = null;
    loading = false;
    motifRejet: string = '';
    displayRejetDialog = false;

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        private consultationService: ConsultationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.consultationId = +this.route.snapshot.params['id'];
        console.log('ValidationComponent - ID:', this.consultationId);
    }

    ngOnInit(): void {
        this.loadConsultation();
    }

    loadConsultation(): void {
        console.log('Loading consultation:', this.consultationId);
        this.loading = true;
        this.consultationService.getById(this.consultationId).subscribe({
            next: (data) => {
                this.consultation = data;
                this.loading = false;
                console.log('Consultation chargée:', data);
            },
            error: (error) => {
                this.loading = false;
                console.error('Erreur chargement:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger le dossier'
                });
                this.router.navigate(['/uab/dossiers']);
            }
        });
    }

    validerR(): void {
        console.log('---------VAL REMB ------------');
        console.log('Consultation ID:', this.consultationId);
        console.log('Consultation:', this.consultation);

        if (!this.consultation) {
            console.error('Consultation est null');
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Dossier non trouvé'
            });
            return;
        }

        const montant = this.consultation.montantPrisEnCharge || 0;
        console.log('Montant à rembourser:', montant);

        this.confirmationService.confirm({
            message: `Confirmez-vous la validation de ce dossier ? Le montant de ${montant.toLocaleString()} FCFA sera remboursé à la structure.`,
            header: 'Confirmation de validation',
            icon: 'pi pi-check-circle',
            accept: () => {
                console.log('Acceptation de la validation');
                this.loading = true;

                console.log('Appel du service valider avec ID:', this.consultationId);
                this.consultationService.valider(this.consultationId).subscribe({
                    next: (response) => {
                        console.log('Réponse validation:', response);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Dossier validé avec succès'
                        });
                        this.router.navigate(['/uab/dossiers']);
                        this.loading = false;
                    },
                    error: (error) => {
                        console.error('Erreur validation:', error);
                        this.loading = false;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: error.error?.message || 'Erreur lors de la validation'
                        });
                    }
                });
            }
        });
    }
    valider(): void {
        console.log('---------VAL REMB ------------');
        console.log('Consultation ID:', this.consultationId);
        console.log('Consultation:', this.consultation);

        if (!this.consultation) {
            console.error('Consultation est null');
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Dossier non trouvé'
            });
            return;
        }

        const montant = this.consultation.montantPrisEnCharge || 0;
        console.log('Montant à rembourser:', montant);

        // Vérifier que confirmationService est bien injecté
        console.log('ConfirmationService:', this.confirmationService);

        this.confirmationService.confirm({
            message: `Confirmez-vous la validation de ce dossier ? Le montant de ${montant.toLocaleString()} FCFA sera remboursé à la structure.`,
            header: 'Confirmation de validation',
            icon: 'pi pi-check-circle',
            accept: () => {
                console.log('✅ ACCEPTATION - Validation confirmée');
                this.loading = true;

                console.log('Appel du service valider avec ID:', this.consultationId);
                this.consultationService.valider(this.consultationId).subscribe({
                    next: (response) => {
                        console.log('✅ Réponse validation:', response);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Dossier validé avec succès'
                        });
                        this.router.navigate(['/uab/dossiers']);
                        this.loading = false;
                    },
                    error: (error) => {
                        console.error('❌ Erreur validation:', error);
                        this.loading = false;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: error.error?.message || 'Erreur lors de la validation'
                        });
                    }
                });
            },
            reject: () => {
                console.log('❌ REJET - Validation annulée');
            }
        });
    }
    rejeter(): void {
        this.displayRejetDialog = true;
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

        this.loading = true;
        this.consultationService.rejeter(this.consultationId, this.motifRejet).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Dossier rejeté'
                });
                this.displayRejetDialog = false;
                this.router.navigate(['/uab/dossiers']);
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors du rejet'
                });
            }
        });
    }

    getTotalPharmacie(): number {
        if (!this.consultation?.prescriptionsMedicaments) return 0;
        return this.consultation.prescriptionsMedicaments.reduce((sum, p) => sum + (p.prixTotal || 0), 0);
    }

    getTotalLaboratoire(): number {
        if (!this.consultation?.prescriptionsExamens) return 0;
        return this.consultation.prescriptionsExamens.reduce((sum, e) => sum + (e.prixTotal || 0), 0);
    }

    getTotalGeneral(): number {
        return (this.consultation?.montantPrisEnCharge || 0) + this.getTotalPharmacie() + this.getTotalLaboratoire();
    }
}
