// pages/components/uab/parametres/taux-couverture/taux-couverture.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TauxCouvertureService } from '../../../services/TauxCouverture/taux-couverture.service';
import { TauxCouverture } from '../../../models/TauxCouverture';

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
            tauxPourcentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
        });
    }

    ngOnInit(): void {
        this.loadTaux();
    }

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
            tauxPourcentage: 0
        });
        this.displayTauxDialog = true;
    }

    editTaux(taux: TauxCouverture): void {
        this.selectedTaux = taux;
        this.tauxForm.patchValue({
            id: taux.id,
            code: taux.code,
            libelle: taux.libelle,
            tauxPourcentage: taux.tauxPourcentage
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
                error: (error) => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: error.error?.message || 'Erreur lors de la modification'
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
            message: `Voulez-vous vraiment supprimer le taux "${taux.libelle}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.tauxService.deleteTaux(taux.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Taux supprimé avec succès'
                        });
                        this.loadTaux();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Erreur lors de la suppression'
                        });
                    }
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
}
