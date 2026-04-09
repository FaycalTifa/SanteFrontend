import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Structure, StructureRequest} from '../../models/structure';
import {StructureService} from '../../services/structure/structure.service';
import {ConfirmationService, MessageService} from 'primeng/api';

@Component({
  selector: 'app-structures',
  templateUrl: './structures.component.html',
  styleUrls: ['./structures.component.scss']
})
export class StructuresComponent implements OnInit {

    structures: Structure[] = [];
    structureTypes: any[] = [];
    loading = false;
    displayDialog = false;
    isEditMode = false;
    selectedStructure: Structure | null = null;
    structureForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private structureService: StructureService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.structureForm = this.fb.group({
            type: ['', Validators.required],
            nom: ['', Validators.required],
            codeStructure: ['', Validators.required],
            adresse: [''],
            telephone: [''],
            email: ['', Validators.email],
            agrement: [''],
            compteBancaire: ['']
        });
    }

    ngOnInit(): void {
        this.loadStructures();
        this.loadStructureTypes();
    }

    loadStructures(): void {
        this.loading = true;
        this.structureService.getAllStructures().subscribe({
            next: (data) => {
                this.structures = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les structures'
                });
            }
        });
    }

    loadStructureTypes(): void {
        this.structureService.getStructureTypes().subscribe({
            next: (data) => {
                this.structureTypes = data;
            },
            error: (err) => {
                console.error('Erreur chargement types:', err);
            }
        });
    }

    openNew(): void {
        this.isEditMode = false;
        this.selectedStructure = null;
        this.structureForm.reset({
            type: '',
            nom: '',
            codeStructure: '',
            adresse: '',
            telephone: '',
            email: '',
            agrement: '',
            compteBancaire: ''
        });
        this.displayDialog = true;
    }

    editStructure(structure: Structure): void {
        this.isEditMode = true;
        this.selectedStructure = structure;
        this.structureForm.patchValue({
            type: structure.type,
            nom: structure.nom,
            codeStructure: structure.codeStructure,
            adresse: structure.adresse,
            telephone: structure.telephone,
            email: structure.email,
            agrement: structure.agrement,
            compteBancaire: structure.compteBancaire
        });
        this.displayDialog = true;
    }

    saveStructure(): void {
        if (this.structureForm.invalid) {
            Object.keys(this.structureForm.controls).forEach(key => {
                this.structureForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.loading = true;
        const formValue = this.structureForm.value;
        const request: StructureRequest = {
            type: formValue.type,
            nom: formValue.nom,
            codeStructure: formValue.codeStructure,
            adresse: formValue.adresse,
            telephone: formValue.telephone,
            email: formValue.email,
            agrement: formValue.agrement,
            compteBancaire: formValue.compteBancaire
        };

        if (this.isEditMode && this.selectedStructure) {
            this.structureService.updateStructure(this.selectedStructure.id, request).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Structure modifiée avec succès'
                    });
                    this.displayDialog = false;
                    this.loadStructures();
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
            this.structureService.createStructure(request).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Structure créée avec succès'
                    });
                    this.displayDialog = false;
                    this.loadStructures();
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

    deleteStructure(structure: Structure): void {
        this.confirmationService.confirm({
            message: `Voulez-vous vraiment désactiver la structure "${structure.nom}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.structureService.desactiverStructure(structure.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Structure désactivée avec succès'
                        });
                        this.loadStructures();
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

    activerStructure(structure: Structure): void {
        this.structureService.activerStructure(structure.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Structure activée avec succès'
                });
                this.loadStructures();
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

    getTypeLabel(type: string): string {
        const types: {[key: string]: string} = {
            HOPITAL: 'Hôpital',
            CLINIQUE: 'Clinique',
            PHARMACIE: 'Pharmacie',
            LABORATOIRE: 'Laboratoire',
            CABINET_MEDICAL: 'Cabinet Médical'
        };
        return types[type] || type;
    }

    getStatutLabel(actif: boolean): string {
        return actif ? 'Actif' : 'Inactif';
    }

    getStatutSeverity(actif: boolean): string {
        return actif ? 'success' : 'danger';
    }
}
