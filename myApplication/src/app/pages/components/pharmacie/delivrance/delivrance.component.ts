import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PrescriptionMedicament} from '../../../models/prescription';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PharmacieService} from '../../../services/pharmacie/pharmacie.service';
import {MessageService} from 'primeng/api';

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

    modesPaiement = [
        { label: 'Espèces', value: 'ESPECES' },
        { label: 'Carte bancaire', value: 'CARTE' },
        { label: 'Mobile Money', value: 'MOBILE_MONEY' },
        { label: 'Chèque', value: 'CHEQUE' }
    ];

    // ✅ Propriétés pour le calcul
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
            prixUnitaire: [0, [Validators.required, Validators.min(0)]],
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
        // Essayer plusieurs sources
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

        // ✅ Écouter les changements des champs
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
                console.log('=== RÉPONSE API PHARMACIE ===');
                console.log('Données complètes:', JSON.stringify(data, null, 2));
                console.log('tauxCouverture:', data.tauxCouverture);
                console.log('prixTotal:', data.prixTotal);
                console.log('montantPrisEnCharge:', data.montantPrisEnCharge);

                this.prescription = data;

                // ✅ Si le taux n'est pas envoyé, le calculer
                if (!this.prescription.tauxCouverture && data.prixTotal && data.montantPrisEnCharge && data.prixTotal > 0) {
                    this.prescription.tauxCouverture = (data.montantPrisEnCharge / data.prixTotal) * 100;
                    console.log('Taux calculé:', this.prescription.tauxCouverture);
                }

                console.log('Taux final utilisé:', this.prescription?.tauxCouverture);

                // Pré-remplir la quantité délivrée
                this.delivranceForm.patchValue({
                    quantiteDelivree: data.quantitePrescitee
                });

                this.calculerMontants();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger la prescription'
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

        console.log('=== CALCUL MONTANTS ===');
        console.log('Prix unitaire:', prixUnitaire);
        console.log('Quantité:', quantite);
        console.log('Prix total:', this.prixTotal);
        console.log('Taux:', taux, '%');
        console.log('UAB rembourse:', this.montantUAB);
        console.log('Patient paye:', this.montantPatient);
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

    onSubmit(): void {
        if (this.delivranceForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez remplir tous les champs obligatoires'
            });
            return;
        }

        const prixUnitaire = this.prixUnitaire;
        if (prixUnitaire <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez saisir un prix unitaire valide'
            });
            return;
        }

        if (this.quantiteDelivree > this.getQuantiteMax()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: `La quantité délivrée (${this.quantiteDelivree}) ne peut pas dépasser la quantité prescrite (${this.getQuantiteMax()})`
            });
            return;
        }

        this.loading = true;
        const request = {
            prescriptionId: this.prescriptionId,
            prixUnitaire,
            quantiteDelivree: this.quantiteDelivree
        };

        this.pharmacieService.delivrerMedicament(request).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Médicament délivré avec succès. Montant encaissé: ${this.montantPatient.toLocaleString()} FCFA`
                });
                this.router.navigate(['/pharmacie/prescriptions-attente']);
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de la délivrance'
                });
            }
        });
    }
}
