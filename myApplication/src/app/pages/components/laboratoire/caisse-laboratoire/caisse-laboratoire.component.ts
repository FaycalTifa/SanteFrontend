// caisse-laboratoire.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescriptionExamen } from '../../../models/prescription';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LaboratoireService } from '../../../services/laboratoire/laboratoire.service';
import { MessageService } from 'primeng/api';
import { Location } from '@angular/common';

@Component({
    selector: 'app-caisse-laboratoire',
    templateUrl: './caisse-laboratoire.component.html',
    styleUrls: ['./caisse-laboratoire.component.scss']
})
export class CaisseLaboratoireComponent implements OnInit {

    examenId: number;
    examen: PrescriptionExamen | null = null;
    paiementForm: FormGroup;
    loading = false;
    montantTicketModerateur = 0;
    montantPrisEnCharge = 0;
    paiementEffectue = false;

    modesPaiement = [
        { label: 'Espèces', value: 'ESPECES', icon: 'pi pi-money-bill' },
        { label: 'Carte bancaire', value: 'CARTE', icon: 'pi pi-credit-card' },
        { label: 'Mobile Money', value: 'MOBILE_MONEY', icon: 'pi pi-mobile' },
        { label: 'Chèque', value: 'CHEQUE', icon: 'pi pi-file' }
    ];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        public router: Router,
        private laboratoireService: LaboratoireService,
        private messageService: MessageService,
        private location: Location
    ) {
        this.examenId = +this.route.snapshot.params.id;
        this.paiementForm = this.fb.group({
            prixTotal: [0, [Validators.required, Validators.min(1)]],
            modePaiement: ['ESPECES', Validators.required],
            referencePaiement: ['']
        });
    }

    ngOnInit(): void {
        this.loadExamen();
        this.paiementForm.get('prixTotal')?.valueChanges.subscribe(() => {
            this.calculerMontants();
        });
    }

    get prixTotal(): number {
        return this.paiementForm.get('prixTotal')?.value || 0;
    }

    setPaymentMethod(method: string): void {
        this.paiementForm.get('modePaiement')?.setValue(method);
    }

    getModePaiementLabel(mode: string): string {
        const modeObj = this.modesPaiement.find(m => m.value === mode);
        return modeObj ? modeObj.label : mode;
    }

    getReferenceLabel(): string {
        const mode = this.paiementForm.get('modePaiement')?.value;
        switch (mode) {
            case 'CHEQUE': return 'Numéro de chèque';
            case 'CARTE': return 'Référence transaction';
            case 'MOBILE_MONEY': return 'Numéro de transaction';
            default: return 'Référence';
        }
    }

    getReferencePlaceholder(): string {
        const mode = this.paiementForm.get('modePaiement')?.value;
        switch (mode) {
            case 'CHEQUE': return 'Ex: CHQ-2024-001';
            case 'CARTE': return 'Ex: 123456789';
            case 'MOBILE_MONEY': return 'Ex: TR-123456';
            default: return 'Entrez la référence';
        }
    }

    annuler(): void {
        this.router.navigate(['/laboratoire/examens-attente']);
    }

    loadExamen(): void {
        this.loading = true;
        this.laboratoireService.getExamenById(this.examenId).subscribe({
            next: (data) => {
                this.examen = data;

                // ✅ Vérification que l'examen est validé par UAB
                if (data.validationUab !== 'OUI') {
                    let statusText = '';
                    if (data.validationUab === 'EN_ATTENTE') {
                        statusText = 'en attente de validation UAB';
                    } else if (data.validationUab === 'NON') {
                        statusText = `rejeté par l'UAB${data.motifRejet ? ' - Motif: ' + data.motifRejet : ''}`;
                    } else {
                        statusText = 'dans un statut inconnu';
                    }

                    this.messageService.add({
                        severity: 'error',
                        summary: '⛔ Paiement impossible',
                        detail: `Cet examen est ${statusText}. Le paiement n'est pas possible.`,
                        life: 6000,
                        sticky: true
                    });
                    this.router.navigate(['/laboratoire/examens-attente']);
                    return;
                }

                if (data.paye) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: '⚠️ Déjà payé',
                        detail: `Cet examen a déjà été payé le ${data.datePaiement ? new Date(data.datePaiement).toLocaleDateString() : 'date inconnue'}.`,
                        life: 5000
                    });
                    this.router.navigate(['/laboratoire/examens-attente']);
                    return;
                }

                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: '❌ Erreur',
                    detail: 'Impossible de charger les informations de l\'examen.',
                    life: 5000
                });
                this.router.navigate(['/laboratoire/examens-attente']);
            }
        });
    }

    calculerMontants(): void {
        const prixTotal = this.paiementForm.get('prixTotal')?.value || 0;
        const taux = this.examen?.tauxCouverture || 80;

        this.montantPrisEnCharge = prixTotal * (taux / 100);
        this.montantTicketModerateur = prixTotal - this.montantPrisEnCharge;
    }

    showRecapBeforePayment(): void {
        const mode = this.paiementForm.get('modePaiement')?.value;
        const reference = this.paiementForm.get('referencePaiement')?.value;

        let recapMessage = `📋 RÉCAPITULATIF DU PAIEMENT\n\n`;
        recapMessage += `🏥 Patient: ${this.examen?.patientPrenom} ${this.examen?.patientNom}\n`;
        recapMessage += `🔬 Examen: ${this.examen?.examenNom}\n`;
        recapMessage += `💰 Prix total: ${this.prixTotal.toLocaleString()} FCFA\n`;
        recapMessage += `🏦 Prise en charge UAB (${this.examen?.tauxCouverture || 80}%): ${this.montantPrisEnCharge.toLocaleString()} FCFA\n`;
        recapMessage += `💳 À payer par le patient: ${this.montantTicketModerateur.toLocaleString()} FCFA\n`;
        recapMessage += `💵 Mode de paiement: ${this.getModePaiementLabel(mode)}\n`;
        if (reference) {
            recapMessage += `🔑 Référence: ${reference}\n`;
        }

        this.messageService.add({
            severity: 'info',
            summary: '📋 Vérification du paiement',
            detail: recapMessage,
            life: 8000,
            sticky: true
        });
    }

    onSubmit(): void {
        // Vérification formulaire
        if (this.paiementForm.invalid) {
            const errorFields = [];
            if (this.paiementForm.get('prixTotal')?.invalid) {
                errorFields.push('prix total invalide');
            }
            if (this.paiementForm.get('modePaiement')?.invalid) {
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

        // Vérification validation UAB
        if (this.examen?.validationUab !== 'OUI') {
            const statusMsg = this.examen?.validationUab === 'EN_ATTENTE'
                ? 'en attente de validation UAB'
                : 'non validé par l\'UAB';
            this.messageService.add({
                severity: 'error',
                summary: '⛔ Validation UAB requise',
                detail: `Cet examen est ${statusMsg}. Le paiement est impossible. Contactez l'UAB.`,
                life: 6000,
                sticky: true
            });
            return;
        }

        // Vérification prix
        const prixTotal = this.paiementForm.get('prixTotal')?.value;
        if (prixTotal <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Prix invalide',
                detail: 'Veuillez saisir un prix total valide (supérieur à 0 FCFA).',
                life: 4000
            });
            return;
        }

        // Vérification référence pour les modes autres qu'espèces
        const mode = this.paiementForm.get('modePaiement')?.value;
        const reference = this.paiementForm.get('referencePaiement')?.value;

        if (mode !== 'ESPECES' && (!reference || reference.trim() === '')) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Référence requise',
                detail: `Pour le paiement par ${this.getModePaiementLabel(mode)}, veuillez saisir une référence.`,
                life: 4000
            });
            return;
        }

        // Afficher récapitulatif avant paiement
        this.showRecapBeforePayment();

        this.loading = true;
        const paiement = {
            prescriptionId: this.examenId,
            prixTotal,
            montantTicketModerateur: this.montantTicketModerateur,
            montantPrisEnCharge: this.montantPrisEnCharge,
            montantPayePatient: this.montantTicketModerateur,
            modePaiement: mode,
            referencePaiement: reference || null
        };

        this.laboratoireService.enregistrerPaiement(paiement).subscribe({
            next: (response) => {
                this.loading = false;
                this.paiementEffectue = true;

                // ✅ MESSAGE DE SUCCÈS CLAIR
                this.messageService.add({
                    severity: 'success',
                    summary: '✅ PAIEMENT RÉUSSI',
                    detail: `Montant encaissé: ${this.montantTicketModerateur.toLocaleString()} FCFA pour l'examen "${this.examen?.examenNom}"`,
                    life: 5000
                });

                // ✅ Message pour la prochaine étape
                this.messageService.add({
                    severity: 'info',
                    summary: '📌 Prochaine étape',
                    detail: 'Vous pouvez maintenant réaliser l\'examen ou continuer à payer d\'autres examens.',
                    life: 4000
                });

                // ✅ Redirection intelligente : retour à la liste des examens
                setTimeout(() => {
                    this.router.navigate(['/laboratoire/examens-attente']);
                }, 2000);
            },
            error: (error) => {
                this.loading = false;

                // ✅ GESTION CLAIRE DES ERREURS
                let errorTitle = '❌ ÉCHEC DU PAIEMENT';
                let errorMessage = '';
                let errorDetail = '';

                if (error.error?.message) {
                    errorMessage = error.error.message;
                    if (error.error.detail) { errorDetail = error.error.detail; }
                } else if (error.status === 0) {
                    errorMessage = 'Impossible de contacter le serveur.';
                    errorDetail = 'Vérifiez que le backend est démarré.';
                } else if (error.status === 401) {
                    errorMessage = 'Session expirée.';
                    errorDetail = 'Veuillez vous reconnecter.';
                    setTimeout(() => this.router.navigate(['/login']), 2000);
                } else if (error.status === 403) {
                    errorMessage = 'Accès non autorisé.';
                    errorDetail = 'Seuls les caissiers peuvent enregistrer des paiements.';
                } else if (error.status === 404) {
                    errorMessage = 'Examen non trouvé.';
                    errorDetail = 'L\'examen n\'existe pas ou a été supprimé.';
                } else if (error.status === 409) {
                    errorMessage = 'Examen déjà payé.';
                    errorDetail = 'Un paiement a déjà été enregistré.';
                } else if (error.status === 500) {
                    errorMessage = 'Erreur serveur.';
                    errorDetail = 'Veuillez réessayer plus tard.';
                } else {
                    errorMessage = errorMessage || 'Une erreur est survenue.';
                }

                // Messages spécifiques
                if (errorMessage.toLowerCase().includes('validé') && errorMessage.toLowerCase().includes('uab')) {
                    errorTitle = '⛔ VALIDATION UAB REQUISE';
                    errorMessage = 'Cet examen n\'a pas été validé par l\'UAB.';
                    errorDetail = 'Veuillez contacter l\'UAB.';
                } else if (errorMessage.toLowerCase().includes('déjà') && errorMessage.toLowerCase().includes('payé')) {
                    errorTitle = '⚠️ DÉJÀ PAYÉ';
                    errorMessage = 'Cet examen a déjà été payé.';
                } else if (errorMessage.toLowerCase().includes('montant')) {
                    errorTitle = '💰 ERREUR DE MONTANT';
                    errorMessage = 'Le montant saisi est invalide.';
                    errorDetail = 'Vérifiez le prix total.';
                }

                // Affichage de l'erreur
                this.messageService.add({
                    severity: 'error',
                    summary: errorTitle,
                    detail: errorMessage,
                    life: 6000
                });

                if (errorDetail) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'ℹ️ Détail',
                            detail: errorDetail,
                            life: 5000
                        });
                    }, 500);
                }

                console.error('Erreur paiement:', error);
            }
        });
    }
}
