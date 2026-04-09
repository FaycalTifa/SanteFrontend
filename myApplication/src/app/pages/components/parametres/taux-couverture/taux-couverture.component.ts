import { Component, OnInit } from '@angular/core';
import {PoliceTaux, PoliceTauxRequest, TauxCouverture} from '../../../models/TauxCouverture';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {TauxCouvertureService} from '../../../services/TauxCouverture/taux-couverture.service';

@Component({
  selector: 'app-taux-couverture',
  templateUrl: './taux-couverture.component.html',
  styleUrls: ['./taux-couverture.component.scss']
})
export class TauxCouvertureComponent implements OnInit {

    tauxList: TauxCouverture[] = [];
    selectedTaux: TauxCouverture | null = null;
    displayTauxDialog = false;
    tauxForm: FormGroup;
    loading = false;

    // Association Police - Taux
    displayAssociationDialog = false;
    associationForm: FormGroup;
    policeRecherchee = '';
    policeInfo: any = null;
    historiqueTaux: PoliceTaux[] = [];

    constructor(
        private fb: FormBuilder,
        private tauxService: TauxCouvertureService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.tauxForm = this.fb.group({
            id: [null],
            code: ['', [Validators.required, Validators.maxLength(50)]],
            libelle: ['', [Validators.required, Validators.maxLength(100)]],
            tauxPourcentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            description: ['']
        });

        this.associationForm = this.fb.group({
            numeroPolice: ['', [Validators.required]],
            tauxId: [null, [Validators.required]],
            dateDebut: [new Date(), [Validators.required]],
            dateFin: ['']
        });
    }

    ngOnInit(): void {
        this.loadTaux();
    }

    // ========== GESTION DES TAUX ==========

    loadTaux(): void {
        this.loading = true;
        this.tauxService.getAllTaux().subscribe({
            next: (data) => {
                this.tauxList = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les taux de couverture'
                });
            }
        });
    }

    openNewTaux(): void {
        this.selectedTaux = null;
        this.tauxForm.reset({
            code: '',
            libelle: '',
            tauxPourcentage: 0,
            description: ''
        });
        this.displayTauxDialog = true;
    }

    editTaux(taux: TauxCouverture): void {
        this.selectedTaux = taux;
        this.tauxForm.patchValue({
            id: taux.id,
            code: taux.code,
            libelle: taux.libelle,
            tauxPourcentage: taux.tauxPourcentage,
            description: taux.description
        });
        this.displayTauxDialog = true;
    }

    saveTaux(): void {
        if (this.tauxForm.invalid) {
            return;
        }

        this.loading = true;
        const tauxData = this.tauxForm.value;

        if (this.selectedTaux) {
            // Modification
            this.tauxService.updateTaux(this.selectedTaux.id, tauxData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Taux modifié avec succès'
                    });
                    this.displayTauxDialog = false;
                    this.loadTaux();
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Erreur lors de la modification'
                    });
                }
            });
        } else {
            // Création
            this.tauxService.createTaux(tauxData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Taux créé avec succès'
                    });
                    this.displayTauxDialog = false;
                    this.loadTaux();
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
    }

    deleteTaux(taux: TauxCouverture): void {
        this.confirmationService.confirm({
            message: `Voulez-vous vraiment désactiver le taux "${taux.libelle}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.tauxService.desactiverTaux(taux.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Taux désactivé avec succès'
                        });
                        this.loadTaux();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Erreur lors de la désactivation'
                        });
                    }
                });
            }
        });
    }

    activerTaux(taux: TauxCouverture): void {
        this.tauxService.activerTaux(taux.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Taux activé avec succès'
                });
                this.loadTaux();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de l\'activation'
                });
            }
        });
    }

    getStatusLabel(actif: boolean): string {
        return actif ? 'Actif' : 'Inactif';
    }

    getStatusSeverity(actif: boolean): string {
        return actif ? 'success' : 'danger';
    }

    // ========== ASSOCIATION POLICE - TAUX ==========

    openAssociationDialog(): void {
        this.associationForm.reset({
            numeroPolice: '',
            tauxId: null,
            dateDebut: new Date(),
            dateFin: ''
        });
        this.policeRecherchee = '';
        this.policeInfo = null;
        this.historiqueTaux = [];
        this.displayAssociationDialog = true;
    }

    rechercherPolice(): void {
        const police = this.associationForm.get('numeroPolice')?.value;
        if (!police || police.length < 5) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez saisir un numéro de police valide'
            });
            return;
        }

        this.loading = true;
        this.tauxService.getTauxActifByPolice(police).subscribe({
            next: (data) => {
                this.policeInfo = data;
                this.loadHistoriquePolice(police);
                this.loading = false;
            },
            error: () => {
                this.policeInfo = null;
                this.loadHistoriquePolice(police);
                this.loading = false;
                this.messageService.add({
                    severity: 'info',
                    summary: 'Information',
                    detail: 'Aucun taux actif trouvé pour cette police'
                });
            }
        });
    }

    loadHistoriquePolice(numeroPolice: string): void {
        this.tauxService.getHistoriqueTauxPolice(numeroPolice).subscribe({
            next: (data) => {
                this.historiqueTaux = data;
            },
            error: () => {
                this.historiqueTaux = [];
            }
        });
    }

    saveAssociation(): void {
        if (this.associationForm.invalid) {
            return;
        }

        this.loading = true;
        const request: PoliceTauxRequest = {
            numeroPolice: this.associationForm.get('numeroPolice')?.value,
            tauxId: this.associationForm.get('tauxId')?.value,
            dateDebut: this.formatDate(this.associationForm.get('dateDebut')?.value),
            dateFin: this.associationForm.get('dateFin')?.value ? this.formatDate(this.associationForm.get('dateFin')?.value) : undefined
        };

        this.tauxService.assignerTaux(request).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Taux associé avec succès'
                });
                this.displayAssociationDialog = false;
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de l\'association'
                });
            }
        });
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
