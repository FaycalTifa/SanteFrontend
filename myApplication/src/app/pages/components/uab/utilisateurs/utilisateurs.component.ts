// pages/components/uab/parametres/utilisateurs/utilisateurs.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import {Utilisateur, UtilisateurRequest} from '../../../models/utilisateur';
import {Structure} from '../../../models/structure';
import {UtilisateurService} from '../../../services/Utilisateur/utilisateur.service';

@Component({
    selector: 'app-utilisateurs',
    templateUrl: './utilisateurs.component.html',
    styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent implements OnInit {

    utilisateurs: Utilisateur[] = [];
    structures: Structure[] = [];
    loading = false;
    displayDialog = false;
    isEditMode = false;
    selectedUtilisateur: Utilisateur | null = null;
    utilisateurForm: FormGroup;

    // ✅ Liste des rôles disponibles
    roles = [
        { label: 'Caissier Hôpital', value: 'CAISSIER_HOPITAL' },
        { label: 'Médecin', value: 'MEDECIN' },
        { label: 'Pharmacien', value: 'PHARMACIEN' },
        { label: 'Caissier Pharmacie', value: 'CAISSIER_PHARMACIE' },
        { label: 'Biologiste', value: 'BIOLOGISTE' },
        { label: 'Caissier Laboratoire', value: 'CAISSIER_LABORATOIRE' },
        { label: 'Admin Structure', value: 'ADMIN_STRUCTURE' },
        { label: 'Admin UAB', value: 'UAB_ADMIN' }
    ];

    // ✅ Rôles sélectionnés pour l'utilisateur
    selectedRoles: string[] = [];

    constructor(
        private fb: FormBuilder,
        private utilisateurService: UtilisateurService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.utilisateurForm = this.fb.group({
            structureId: [null],
            nom: ['', Validators.required],
            prenom: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(4)]],
            telephone: ['']
            // ✅ Supprimer le champ role unique
        });
    }

    ngOnInit(): void {
        this.loadUtilisateurs();
        this.loadStructures();
    }

    loadUtilisateurs(): void {
        this.loading = true;
        this.utilisateurService.getAllUtilisateurs().subscribe({
            next: (data) => {
                this.utilisateurs = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les utilisateurs'
                });
            }
        });
    }

    loadStructures(): void {
        this.utilisateurService.getAllStructures().subscribe({
            next: (data) => {
                this.structures = data;
            },
            error: (err) => {
                console.error('Erreur chargement structures:', err);
            }
        });
    }

    openNew(): void {
        this.isEditMode = false;
        this.selectedUtilisateur = null;
        this.selectedRoles = []; // ✅ Réinitialiser les rôles sélectionnés
        this.utilisateurForm.reset({
            structureId: null,
            nom: '',
            prenom: '',
            email: '',
            password: '',
            telephone: ''
        });
        this.displayDialog = true;
    }

    // utilisateurs.component.ts
    editUtilisateur(utilisateur: Utilisateur): void {
        console.log('=== ÉDITION UTILISATEUR ===');
        console.log('Utilisateur reçu:', utilisateur);
        console.log('Rôles de l\'utilisateur:', utilisateur.roles);

        this.isEditMode = true;
        this.selectedUtilisateur = utilisateur;

        // ✅ Copier les rôles existants
        this.selectedRoles = utilisateur.roles && Array.isArray(utilisateur.roles)
            ? [...utilisateur.roles]
            : [];

        console.log('selectedRoles après copie:', this.selectedRoles);

        // ✅ Forcer la détection des changements
        setTimeout(() => {
            console.log('selectedRoles après timeout:', this.selectedRoles);
        }, 100);

        this.utilisateurForm.patchValue({
            structureId: utilisateur.structureId,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            email: utilisateur.email,
            password: '',
            telephone: utilisateur.telephone || ''
        });

        this.utilisateurForm.get('password')?.clearValidators();
        this.utilisateurForm.get('password')?.updateValueAndValidity();

        this.displayDialog = true;
    }

    saveUtilisateur(): void {
        if (this.utilisateurForm.invalid) {
            Object.keys(this.utilisateurForm.controls).forEach(key => {
                this.utilisateurForm.get(key)?.markAsTouched();
            });
            return;
        }

        // ✅ Vérifier qu'au moins un rôle est sélectionné
        if (this.selectedRoles.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez sélectionner au moins un rôle'
            });
            return;
        }

        this.loading = true;
        const formValue = this.utilisateurForm.value;
        const request: UtilisateurRequest = {
            structureId: formValue.structureId,
            nom: formValue.nom,
            prenom: formValue.prenom,
            email: formValue.email,
            password: formValue.password,
            roles: this.selectedRoles, // ✅ Envoyer la liste des rôles
            telephone: formValue.telephone
        };

        if (this.isEditMode && this.selectedUtilisateur) {
            // Mise à jour
            this.utilisateurService.updateUtilisateur(this.selectedUtilisateur.id, request).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Utilisateur modifié avec succès'
                    });
                    this.displayDialog = false;
                    this.loadUtilisateurs();
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
            this.utilisateurService.createUtilisateur(request).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Utilisateur créé avec succès'
                    });
                    this.displayDialog = false;
                    this.loadUtilisateurs();
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

    deleteUtilisateur(utilisateur: Utilisateur): void {
        this.confirmationService.confirm({
            message: `Voulez-vous vraiment désactiver l'utilisateur "${utilisateur.prenom} ${utilisateur.nom}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.utilisateurService.desactiverUtilisateur(utilisateur.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Utilisateur désactivé avec succès'
                        });
                        this.loadUtilisateurs();
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

    activerUtilisateur(utilisateur: Utilisateur): void {
        this.utilisateurService.activerUtilisateur(utilisateur.id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Utilisateur activé avec succès'
                });
                this.loadUtilisateurs();
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

    // ✅ Obtenir le libellé d'un rôle
    getRoleLabel(role: string): string {
        const rolesMap: {[key: string]: string} = {
            CAISSIER_HOPITAL: 'Caissier Hôpital',
            MEDECIN: 'Médecin',
            PHARMACIEN: 'Pharmacien',
            CAISSIER_PHARMACIE: 'Caissier Pharmacie',
            BIOLOGISTE: 'Biologiste',
            CAISSIER_LABORATOIRE: 'Caissier Laboratoire',
            ADMIN_STRUCTURE: 'Admin Structure',
            UAB_ADMIN: 'Admin UAB'
        };
        return rolesMap[role] || role;
    }

    // ✅ Obtenir les libellés des rôles d'un utilisateur
    getRolesLabels(roles: string[]): string {
        return roles.map(r => this.getRoleLabel(r)).join(', ');
    }

    getStatutLabel(actif: boolean): string {
        return actif ? 'Actif' : 'Inactif';
    }

    getStatutSeverity(actif: boolean): string {
        return actif ? 'success' : 'danger';
    }

    // ✅ Vérifier si un rôle est sélectionné
    isRoleSelected(roleCode: string): boolean {
        const isSelected = this.selectedRoles.includes(roleCode);
        console.log(`isRoleSelected(${roleCode}):`, isSelected);
        return isSelected;
    }

    // ✅ Ajouter/retirer un rôle
    // Dans votre composant
    toggleRole(roleCode: string): void {
        console.log('toggleRole appelé pour:', roleCode);
        console.log('selectedRoles avant:', [...this.selectedRoles]);

        const index = this.selectedRoles.indexOf(roleCode);
        if (index === -1) {
            this.selectedRoles.push(roleCode);
            console.log('Rôle ajouté:', roleCode);
        } else {
            this.selectedRoles.splice(index, 1);
            console.log('Rôle retiré:', roleCode);
        }

        console.log('selectedRoles après:', [...this.selectedRoles]);
    }

    }
