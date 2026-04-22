import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescriptionMedicament } from '../../../models/prescription';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PharmacieService } from '../../../services/pharmacie/pharmacie.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-delivrance',
    templateUrl: './delivrance.component.html',
    styleUrls: ['./delivrance.component.scss']
})
export class DelivranceComponent implements OnInit {

    prescriptionId: number;
    prescription: PrescriptionMedicament | null = null;
    delivranceForm: FormGroup;
    loading = false;
    delivranceEffectuee = false;

    modesPaiement = [
        { label: 'Espèces', value: 'ESPECES', icon: 'pi pi-money-bill' },
        { label: 'Carte bancaire', value: 'CARTE', icon: 'pi pi-credit-card' },
        { label: 'Mobile Money', value: 'MOBILE_MONEY', icon: 'pi pi-mobile' },
        { label: 'Chèque', value: 'CHEQUE', icon: 'pi pi-file' }
    ];

    // Propriétés pour le calcul
    prixTotal = 0;
    montantPatient = 0;
    montantUAB = 0;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        public router: Router,
        private pharmacieService: PharmacieService,
        private messageService: MessageService
    ) {
        this.prescriptionId = +this.route.snapshot.params.id;
        this.delivranceForm = this.fb.group({
            prixUnitaire: [0, [Validators.required, Validators.min(1)]],
            quantiteDelivree: [0, [Validators.required, Validators.min(1)]],
            modePaiement: ['ESPECES', Validators.required],
            referencePaiement: ['']
        });
    }

    get prixUnitaire(): number {
        return this.delivranceForm.get('prixUnitaire')?.value || 0;
    }

    get quantiteDelivree(): number {
        return this.delivranceForm.get('quantiteDelivree')?.value || 0;
    }

    get tauxCouverture(): number {
        if (this.prescription?.tauxCouverture) {
            return this.prescription.tauxCouverture;
        }
        if (this.prescription?.montantPrisEnCharge && this.prescription?.prixTotal && this.prescription.prixTotal > 0) {
            return (this.prescription.montantPrisEnCharge / this.prescription.prixTotal) * 100;
        }
        return 80;
    }

    ngOnInit(): void {
        this.loadPrescription();

        this.delivranceForm.get('prixUnitaire')?.valueChanges.subscribe(() => {
            this.calculerMontants();
        });

        this.delivranceForm.get('quantiteDelivree')?.valueChanges.subscribe(() => {
            this.calculerMontants();
        });
    }

    loadPrescription(): void {
        this.loading = true;
        this.pharmacieService.getPrescriptionById(this.prescriptionId).subscribe({
            next: (data) => {
                console.log('=== RÉPONSE API PHARMACIE ===', data);

                this.prescription = data;

                if (!this.prescription.tauxCouverture && data.prixTotal && data.montantPrisEnCharge && data.prixTotal > 0) {
                    this.prescription.tauxCouverture = (data.montantPrisEnCharge / data.prixTotal) * 100;
                }

                // Vérifier si déjà délivré
                if (data.delivre) {
                    this.delivranceEffectuee = true;
                    this.delivranceForm.disable();
                    this.messageService.add({
                        severity: 'info',
                        summary: 'ℹ️ Information',
                        detail: `Ce médicament a déjà été délivré le ${data.dateDelivrance ? new Date(data.dateDelivrance).toLocaleDateString() : 'date inconnue'}. Quantité: ${data.quantiteDelivree} sur ${data.quantitePrescitee}.`,
                        life: 5000
                    });
                }

                this.delivranceForm.patchValue({
                    quantiteDelivree: data.quantitePrescitee
                });

                this.calculerMontants();
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                let errorMsg = 'Impossible de charger la prescription';
                if (error.status === 404) {
                    errorMsg = 'Prescription non trouvée. Vérifiez que l\'ordonnance existe.';
                } else if (error.status === 403) {
                    errorMsg = 'Vous n\'avez pas les droits pour accéder à cette prescription.';
                } else if (error.status === 401) {
                    errorMsg = 'Session expirée. Veuillez vous reconnecter.';
                    setTimeout(() => this.router.navigate(['/login']), 2000);
                }
                this.messageService.add({
                    severity: 'error',
                    summary: '❌ Erreur',
                    detail: errorMsg,
                    life: 5000
                });
                this.router.navigate(['/pharmacie/prescriptions-attente']);
            }
        });
    }

    calculerMontants(): void {
        const prixUnitaire = this.prixUnitaire;
        const quantite = this.quantiteDelivree;
        const taux = this.tauxCouverture;

        this.prixTotal = prixUnitaire * quantite;
        this.montantUAB = this.prixTotal * (taux / 100);
        this.montantPatient = this.prixTotal - this.montantUAB;
    }

    getModePaiementLabel(mode: string): string {
        const modeObj = this.modesPaiement.find(m => m.value === mode);
        return modeObj ? modeObj.label : mode;
    }

    getModePaiementIcon(mode: string): string {
        const modeObj = this.modesPaiement.find(m => m.value === mode);
        return modeObj ? modeObj.icon : 'pi pi-credit-card';
    }

    setPaymentMethod(method: string): void {
        this.delivranceForm.get('modePaiement')?.setValue(method);
    }

    getReferenceLabel(): string {
        const mode = this.delivranceForm.get('modePaiement')?.value;
        switch (mode) {
            case 'CHEQUE': return 'Numéro de chèque';
            case 'CARTE': return 'Référence transaction';
            case 'MOBILE_MONEY': return 'Numéro de transaction';
            default: return 'Référence';
        }
    }

    getReferencePlaceholder(): string {
        const mode = this.delivranceForm.get('modePaiement')?.value;
        switch (mode) {
            case 'CHEQUE': return 'Ex: CHQ-2024-001';
            case 'CARTE': return 'Ex: 123456789';
            case 'MOBILE_MONEY': return 'Ex: TR-123456';
            default: return 'Entrez la référence';
        }
    }

    getQuantiteMax(): number {
        return this.prescription?.quantitePrescitee || 0;
    }

    annuler(): void {
        this.router.navigate(['/pharmacie/prescriptions-attente']);
    }

    /**
     * Afficher un récapitulatif avant délivrance
     */
    showRecap(): void {
        const mode = this.delivranceForm.get('modePaiement')?.value;
        const reference = this.delivranceForm.get('referencePaiement')?.value;

        let recapMessage = `📋 RÉCAPITULATIF DE LA DÉLIVRANCE\n\n`;
        recapMessage += `👤 Patient: ${this.prescription?.patientPrenom} ${this.prescription?.patientNom}\n`;
        recapMessage += `💊 Médicament: ${this.prescription?.medicamentNom}\n`;
        recapMessage += `📦 Dosage: ${this.prescription?.medicamentDosage || '-'}\n`;
        recapMessage += `💰 Prix unitaire: ${this.prixUnitaire.toLocaleString()} FCFA\n`;
        recapMessage += `🔢 Quantité: ${this.quantiteDelivree} / ${this.getQuantiteMax()}\n`;
        recapMessage += `💵 Total: ${this.prixTotal.toLocaleString()} FCFA\n`;
        recapMessage += `🏦 Prise en charge UAB (${this.tauxCouverture}%): ${this.montantUAB.toLocaleString()} FCFA\n`;
        recapMessage += `💳 À payer par patient: ${this.montantPatient.toLocaleString()} FCFA\n`;
        recapMessage += `💵 Mode de paiement: ${this.getModePaiementLabel(mode)}\n`;
        if (reference) {
            recapMessage += `🔑 Référence: ${reference}\n`;
        }

        this.messageService.add({
            severity: 'info',
            summary: '📋 Vérification de la délivrance',
            detail: recapMessage,
            life: 8000,
            sticky: true
        });
    }

    onSubmit(): void {
        // Vérifier si déjà délivré
        if (this.delivranceEffectuee || this.prescription?.delivre) {
            this.messageService.add({
                severity: 'error',
                summary: '⛔ Délivrance impossible',
                detail: 'Ce médicament a déjà été délivré. Une nouvelle délivrance n\'est pas possible.',
                life: 5000
            });
            return;
        }

        // Vérifier le formulaire
        if (this.delivranceForm.invalid) {
            const errorFields = [];
            if (this.delivranceForm.get('prixUnitaire')?.invalid) {
                errorFields.push('prix unitaire valide');
            }
            if (this.delivranceForm.get('quantiteDelivree')?.invalid) {
                errorFields.push('quantité valide');
            }
            if (this.delivranceForm.get('modePaiement')?.invalid) {
                errorFields.push('mode de paiement');
            }

            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Formulaire incomplet',
                detail: `Veuillez corriger: ${errorFields.join(', ')}`,
                life: 4000
            });
            return;
        }

        const prixUnitaire = this.prixUnitaire;
        if (prixUnitaire <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Prix invalide',
                detail: 'Veuillez saisir un prix unitaire valide (supérieur à 0 FCFA).',
                life: 4000
            });
            return;
        }

        if (this.quantiteDelivree > this.getQuantiteMax()) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Quantité excessive',
                detail: `La quantité délivrée (${this.quantiteDelivree}) ne peut pas dépasser la quantité prescrite (${this.getQuantiteMax()}).`,
                life: 4000
            });
            return;
        }

        if (this.quantiteDelivree <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Quantité invalide',
                detail: 'La quantité délivrée doit être supérieure à 0.',
                life: 4000
            });
            return;
        }

        // Vérifier la référence pour les modes autres qu'espèces
        const mode = this.delivranceForm.get('modePaiement')?.value;
        const reference = this.delivranceForm.get('referencePaiement')?.value;

        if (mode !== 'ESPECES' && (!reference || reference.trim() === '')) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Référence requise',
                detail: `Pour le paiement par ${this.getModePaiementLabel(mode)}, veuillez saisir une référence.`,
                life: 4000
            });
            return;
        }

        // Afficher le récapitulatif
        this.showRecap();

        this.loading = true;
        const request = {
            prescriptionId: this.prescriptionId,
            prixUnitaire,
            quantiteDelivree: this.quantiteDelivree
        };

        this.pharmacieService.delivrerMedicament(request).subscribe({
            next: (response) => {
                this.loading = false;
                this.delivranceEffectuee = true;

                // ✅ MESSAGE DE SUCCÈS DÉTAILLÉ
                const successMessage = `
                    ✅ DÉLIVRANCE EFFECTUÉE AVEC SUCCÈS !

                    📋 Détails de la délivrance:
                    ─────────────────────────
                    👤 Patient: ${this.prescription?.patientPrenom} ${this.prescription?.patientNom}
                    💊 Médicament: ${this.prescription?.medicamentNom}
                    📦 Dosage: ${this.prescription?.medicamentDosage || '-'}
                    💰 Prix unitaire: ${prixUnitaire.toLocaleString()} FCFA
                    🔢 Quantité délivrée: ${this.quantiteDelivree} / ${this.getQuantiteMax()}
                    💵 Total: ${this.prixTotal.toLocaleString()} FCFA
                    🏦 UAB prend en charge: ${this.montantUAB.toLocaleString()} FCFA
                    💳 Payé par patient: ${this.montantPatient.toLocaleString()} FCFA
                    💵 Mode: ${this.getModePaiementLabel(mode)}
                    ${reference ? `🔑 Référence: ${reference}` : ''}
                    📅 Date: ${new Date().toLocaleString()}

                    ➡️ Prochaine étape: La délivrance est terminée.
                `;

                this.messageService.add({
                    severity: 'success',
                    summary: '✅ DÉLIVRANCE RÉUSSIE',
                    detail: `Médicament délivré avec succès. Montant: ${this.montantPatient.toLocaleString()} FCFA`,
                    life: 10000,
                    sticky: true
                });

                // Redirection après 3 secondes
                setTimeout(() => {
                    this.router.navigate(['/pharmacie/prescriptions-attente']);
                }, 2000);
            },
            error: (error) => {
                this.loading = false;

                // ✅ GESTION DÉTAILLÉE DES ERREURS
                let errorTitle = '❌ ÉCHEC DE LA DÉLIVRANCE';
                let errorMessage = '';
                let errorDetail = '';

                if (error.error?.message) {
                    errorMessage = error.error.message;
                    if (error.error.detail) { errorDetail = error.error.detail; }
                } else if (error.status === 0) {
                    errorMessage = 'Impossible de contacter le serveur.';
                    errorDetail = 'Vérifiez que le backend est démarré et que vous êtes connecté au réseau.';
                } else if (error.status === 401) {
                    errorMessage = 'Session expirée.';
                    errorDetail = 'Veuillez vous reconnecter pour effectuer la délivrance.';
                    setTimeout(() => this.router.navigate(['/login']), 3000);
                } else if (error.status === 403) {
                    errorMessage = 'Vous n\'avez pas les droits pour effectuer cette opération.';
                    errorDetail = 'Seuls les pharmaciens peuvent délivrer des médicaments.';
                } else if (error.status === 404) {
                    errorMessage = 'Prescription non trouvée.';
                    errorDetail = 'La prescription que vous tentez de délivrer n\'existe pas ou a été supprimée.';
                } else if (error.status === 409) {
                    errorMessage = 'Cette prescription a déjà été délivrée.';
                    errorDetail = 'Un médicament ne peut être délivré qu\'une seule fois.';
                } else if (error.status === 422) {
                    errorMessage = 'Données de délivrance invalides.';
                    errorDetail = 'Vérifiez que tous les champs sont correctement remplis.';
                } else if (error.status === 500) {
                    errorMessage = 'Erreur interne du serveur.';
                    errorDetail = 'Veuillez réessayer plus tard ou contacter l\'administrateur.';
                } else {
                    errorMessage = errorMessage || 'Une erreur inattendue est survenue.';
                }

                // Messages spécifiques selon le contenu
                if (errorMessage.toLowerCase().includes('déjà') && errorMessage.toLowerCase().includes('délivré')) {
                    errorTitle = '⚠️ DÉJÀ DÉLIVRÉ';
                    errorMessage = 'Ce médicament a déjà été délivré.';
                    errorDetail = 'Une nouvelle délivrance n\'est pas possible.';
                } else if (errorMessage.toLowerCase().includes('quantité') || errorMessage.toLowerCase().includes('quantite')) {
                    errorTitle = '🔢 ERREUR DE QUANTITÉ';
                    errorMessage = 'La quantité saisie est invalide.';
                    errorDetail = 'Vérifiez que la quantité ne dépasse pas la quantité prescrite.';
                } else if (errorMessage.toLowerCase().includes('prix')) {
                    errorTitle = '💰 ERREUR DE PRIX';
                    errorMessage = 'Le prix unitaire saisi est invalide.';
                    errorDetail = 'Veuillez saisir un prix valide.';
                }

                // Affichage du message d'erreur principal
                this.messageService.add({
                    severity: 'error',
                    summary: errorTitle,
                    detail: errorMessage,
                    life: 8000,
                    sticky: error.status === 0 || error.status === 500
                });

                // Affichage du détail si disponible
                if (errorDetail) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'ℹ️ Détail de l\'erreur',
                            detail: errorDetail,
                            life: 6000
                        });
                    }, 500);
                }

                console.error('=== ERREUR DÉLIVRANCE ===');
                console.error('Status:', error.status);
                console.error('Message:', error.message);
                console.error('Details:', error.error);
            }
        });
    }
}
