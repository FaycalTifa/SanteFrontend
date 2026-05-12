// validation.component.ts - Version corrigée
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { StructureDashboardService } from '../../../services/StructureDashboard/structure-dashboard.service';
import { ConsultationService } from '../../../services/consultation/consultation.service';
import { AuthService } from '../../../services/auth/auth.service';
import {UabService} from "../../../services/uab/uab.service";
import {CacheService} from "../../../services/cache/cache.service";
import {DashboardRefreshService} from "../../../services/DashboardRefresh/dashboard-refresh.service";

@Component({
    selector: 'app-validation',
    templateUrl: './validation.component.html',
    styleUrls: ['./validation.component.scss']
})
export class ValidationComponent implements OnInit {

    dossierId: number;
    dossierType = 'CONSULTATION';
    dossier: any = null;
    loading = false;
    motifRejet = '';
    displayRejetDialog = false;

    isUABAdmin = false;
    isStructureAdmin = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private cacheService: CacheService,
        private structureService: StructureDashboardService,
        private consultationService: ConsultationService,
        private uabService: UabService,
        private dashboardRefreshService: DashboardRefreshService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.dossierId = +this.route.snapshot.params.id;
        this.dossierType = this.route.snapshot.queryParams.type || 'CONSULTATION';

        const currentUrl = this.router.url;
        this.isUABAdmin = currentUrl.includes('/uab/validation');
        this.isStructureAdmin = currentUrl.includes('/structure/validation');

        console.log('ValidationComponent - ID:', this.dossierId, 'Type:', this.dossierType);
        console.log('isUABAdmin:', this.isUABAdmin, 'isStructureAdmin:', this.isStructureAdmin);
    }

    ngOnInit(): void {
        this.loadDossier();
    }

    loadDossier(): void {
        console.log('Loading dossier:', this.dossierId, 'Type attendu:', this.dossierType);
        this.loading = true;

        if (this.isUABAdmin) {
            // ✅ Passer le type à l'API
            this.consultationService.getDossierDetail(this.dossierId, this.dossierType).subscribe({
                next: (data) => {
                    this.dossier = data;
                    console.log('=== DOSSIER CHARGÉ ===');
                    console.log('Type retourné par API:', this.dossier?.type);
                    console.log('Données reçues:', JSON.stringify(this.dossier, null, 2));

                    // Vérification spécifique selon le type
                    if (this.dossierType === 'PRESCRIPTION_MEDICAMENT') {
                        console.log('=== MÉDICAMENT ===');
                        console.log('Nom:', this.dossier?.medicamentNom);
                        console.log('Dosage:', this.dossier?.medicamentDosage);
                        console.log('Forme:', this.dossier?.medicamentForme);
                        console.log('Quantité:', this.dossier?.quantite);
                        console.log('Prix total:', this.dossier?.montantTotal);
                        console.log('Pris en charge:', this.dossier?.montantPrisEnCharge);
                    } else if (this.dossierType === 'PRESCRIPTION_EXAMEN') {
                        console.log('=== EXAMEN ===');
                        console.log('Nom:', this.dossier?.examenNom);
                        console.log('Payé:', this.dossier?.paye);
                        console.log('Date paiement:', this.dossier?.datePaiement);
                        console.log('Réalisé:', this.dossier?.realise);
                    } else if (this.dossierType === 'CONSULTATION') {
                        console.log('=== CONSULTATION ===');
                        console.log('Nature maladie:', this.dossier?.natureMaladie);
                        console.log('Diagnostic:', this.dossier?.diagnostic);
                        console.log('Médecin:', this.dossier?.medecinNom);
                    }

                    this.loading = false;
                },
                error: (error) => {
                    this.loading = false;
                    console.error('Erreur détaillée:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de charger le dossier'
                    });
                    this.router.navigate(['/uab/dossiers']);
                }
            });
        }  else if (this.isStructureAdmin) {
            // ✅ STRUCTURE: passer le type aussi !
            this.structureService.getDossierById(this.dossierId, this.dossierType).subscribe({
                next: (data) => {
                    this.dossier = data;
                    console.log('=== DOSSIER STRUCTURE CHARGÉ ===');
                    console.log('Type retourné:', this.dossier?.type);

                    if (this.dossierType === 'PRESCRIPTION_MEDICAMENT') {
                        console.log('=== MÉDICAMENT ===');
                        console.log('Nom:', this.dossier?.medicamentNom);
                        console.log('Dosage:', this.dossier?.medicamentDosage);
                        console.log('Forme:', this.dossier?.medicamentForme);
                        console.log('Quantité:', this.dossier?.quantite);
                    }
                    this.loading = false;
                },
                error: (error) => {
                    this.loading = false;
                    console.error('Erreur:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de charger le dossier'
                    });
                    this.router.navigate(['/structure/dashboard']);
                }
            });
        }
    }

    // ✅ Ajouter cette méthode pour vérifier si c'est un médicament
    isMedicament(): boolean {
        return this.dossierType === 'PRESCRIPTION_MEDICAMENT';
    }

    // ✅ Ajouter cette méthode pour vérifier si c'est un examen
    isExamen(): boolean {
        return this.dossierType === 'PRESCRIPTION_EXAMEN';
    }

    // ✅ Ajouter cette méthode pour vérifier si c'est une consultation
    isConsultation(): boolean {
        return this.dossierType === 'CONSULTATION';
    }

    getMontantTotal(): number {
        return this.dossier?.montantPrisEnCharge || 0;
    }

    getTypeLabel(): string {
        const types: { [key: string]: string } = {
            CONSULTATION: 'Consultation',
            PRESCRIPTION_MEDICAMENT: 'Prescription Médicament',
            PRESCRIPTION_EXAMEN: 'Prescription Examen'
        };
        return types[this.dossierType] || this.dossierType;
    }

    getOrigineLabel(): string {
        const origines: { [key: string]: string } = {
            HOPITAL: '🏥 Hôpital',
            PHARMACIE: '💊 Pharmacie',
            LABORATOIRE: '🔬 Laboratoire'
        };
        return origines[this.dossier?.origine] || this.dossier?.origine || '';
    }

    valider(): void {
        const montant = this.getMontantTotal();
        const message = `Confirmez-vous la validation de ce dossier ?\n\n` +
            `Type: ${this.getTypeLabel()}\n` +
            `Montant: ${montant.toLocaleString()} FCFA\n\n` +
            `Cette action est irréversible.`;

        this.confirmationService.confirm({
            message,
            header: 'Confirmation de validation',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Oui, valider',
            rejectLabel: 'Annuler',
            accept: () => {
                console.log('✅ Validation confirmée pour le type:', this.dossierType);
                this.loading = true;

                if (this.isUABAdmin) {
                    this.consultationService.validerDossier(
                        this.dossierId,
                        this.dossierType,
                        null
                    ).subscribe({
                        next: (response) => {
                            console.log('✅ Réponse validation:', response);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Succès',
                                detail: `Dossier ${this.getTypeLabel()} validé avec succès`
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
                } else {
                    this.structureService.validerDossier(
                        this.dossierId,
                        this.dossierType,
                        null
                    ).subscribe({
                        next: (response) => {
                            console.log('✅ Réponse validation Structure:', response);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Succès',
                                detail: `Dossier ${this.getTypeLabel()} validé avec succès`
                            });
                            this.router.navigate(['/structure/dashboard']);
                            this.loading = false;
                        },
                        error: (error) => {
                            console.error('❌ Erreur validation Structure:', error);
                            this.loading = false;
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Erreur',
                                detail: error.error?.message || 'Erreur lors de la validation'
                            });
                        }
                    });
                }
            },
            reject: () => {
                console.log('❌ Validation annulée');
            }
        });
    }

    payer(): void {
        this.confirmationService.confirm({
            message: `Confirmez-vous le paiement UAB de ${this.getMontantTotal().toLocaleString()} FCFA ?`,
            accept: () => {
                this.loading = true;
                this.uabService.payerDossier(this.dossierId, this.dossierType).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Paiement effectué',
                            detail: 'Dossier marqué comme payé par l\'UAB'
                        });
                        // ✅ Notification au dashboard
                        this.dashboardRefreshService.notifyRefresh();
                        this.router.navigate(['/uab/dossiers'], { queryParams: { payeParUab: false } });
                    },
                    error: (error) => {
                        this.loading = false;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: error.error?.message || 'Échec du paiement'
                        });
                    }
                });
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

        if (this.isUABAdmin) {
            this.consultationService.rejeterDossier(
                this.dossierId,
                this.dossierType,
                this.motifRejet
            ).subscribe({
                next: (response) => {
                    console.log('✅ Réponse rejet:', response);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `Dossier ${this.getTypeLabel()} rejeté`
                    });
                    this.displayRejetDialog = false;
                    this.router.navigate(['/uab/dossiers']);
                    this.loading = false;
                },
                error: (error) => {
                    console.error('❌ Erreur rejet:', error);
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: error.error?.message || 'Erreur lors du rejet'
                    });
                }
            });
        } else {
            this.structureService.rejeterDossier(
                this.dossierId,
                this.dossierType,
                this.motifRejet
            ).subscribe({
                next: (response) => {
                    console.log('✅ Réponse rejet Structure:', response);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `Dossier ${this.getTypeLabel()} rejeté`
                    });
                    this.displayRejetDialog = false;
                    this.router.navigate(['/structure/dashboard']);
                    this.loading = false;
                },
                error: (error) => {
                    console.error('❌ Erreur rejet Structure:', error);
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: error.error?.message || 'Erreur lors du rejet'
                    });
                }
            });
        }
    }
}
