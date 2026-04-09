import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PrescriptionExamen} from '../../../models/prescription';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LaboratoireService} from '../../../services/laboratoire/laboratoire.service';
import {MessageService} from 'primeng/api';

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

    modesPaiement = [
        { label: 'Espèces', value: 'ESPECES' },
        { label: 'Carte bancaire', value: 'CARTE' },
        { label: 'Mobile Money', value: 'MOBILE_MONEY' },
        { label: 'Chèque', value: 'CHEQUE' }
    ];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        public router: Router,
        private laboratoireService: LaboratoireService,
        private messageService: MessageService
    ) {
        this.examenId = +this.route.snapshot.params.id;
        this.paiementForm = this.fb.group({
            prixTotal: [0, [Validators.required, Validators.min(0)]],
            modePaiement: ['ESPECES', Validators.required],
            referencePaiement: ['']
        });
    }

    ngOnInit(): void {
        this.loadExamen();

        // Écouter les changements de prix
        this.paiementForm.get('prixTotal')?.valueChanges.subscribe(() => {
            this.calculerMontants();
        });
    }


    // ✅ Propriétés pour le calcul temps réel
    get prixTotal(): number {
        return this.paiementForm.get('prixTotal')?.value || 0;
    }
    // Ajoutez ces méthodes dans votre composant

// Définir le mode de paiement
    setPaymentMethod(method: string): void {
        this.paiementForm.get('modePaiement')?.setValue(method);
    }

// Obtenir le libellé de la référence
    getReferenceLabel(): string {
        const mode = this.paiementForm.get('modePaiement')?.value;
        switch (mode) {
            case 'CHEQUE': return 'Numéro de chèque';
            case 'CARTE': return 'Référence transaction';
            case 'MOBILE_MONEY': return 'Numéro de transaction';
            default: return 'Référence';
        }
    }

// Obtenir le placeholder de la référence
    getReferencePlaceholder(): string {
        const mode = this.paiementForm.get('modePaiement')?.value;
        switch (mode) {
            case 'CHEQUE': return 'Ex: CHQ-2024-001';
            case 'CARTE': return 'Ex: 123456789';
            case 'MOBILE_MONEY': return 'Ex: TR-123456';
            default: return 'Entrez la référence';
        }
    }

// Annuler et retourner
    annuler(): void {
        this.router.navigate(['/laboratoire/examens-attente']);
    }

    loadExamen(): void {
        this.loading = true;
        this.laboratoireService.getExamenById(this.examenId).subscribe({
            next: (data) => {
                this.examen = data;
                console.log('=== EXAMEN CHARGÉ ===');
                console.log('Taux de couverture:', this.examen.tauxCouverture);
                console.log('Examen complet:', this.examen);
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger l\'examen'
                });
                this.router.navigate(['/laboratoire/examens-attente']);
            }
        });
    }

    calculerMontants(): void {
        const prixTotal = this.paiementForm.get('prixTotal')?.value || 0;
        const taux = this.examen?.tauxCouverture || 80;

        console.log('=== CALCUL MONTANTS ===');
        console.log('Prix total:', prixTotal);
        console.log('Taux utilisé:', taux);
        console.log('Source du taux:', this.examen?.tauxCouverture ? 'de l\'examen' : 'valeur par défaut');

        this.montantPrisEnCharge = prixTotal * (taux / 100);
        this.montantTicketModerateur = prixTotal - this.montantPrisEnCharge;

        console.log('Pris en charge UAB:', this.montantPrisEnCharge);
        console.log('Ticket modérateur patient:', this.montantTicketModerateur);
    }
    onSubmit(): void {
        if (this.paiementForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez remplir tous les champs obligatoires'
            });
            return;
        }

        const prixTotal = this.paiementForm.get('prixTotal')?.value;
        if (prixTotal <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez saisir un prix valide'
            });
            return;
        }

        this.loading = true;
        const paiement = {
            prescriptionId: this.examenId,
            prixTotal,
            montantTicketModerateur: this.montantTicketModerateur,
            montantPrisEnCharge: this.montantPrisEnCharge,
            montantPayePatient: this.montantTicketModerateur,
            modePaiement: this.paiementForm.get('modePaiement')?.value,
            referencePaiement: this.paiementForm.get('referencePaiement')?.value
        };

        this.laboratoireService.enregistrerPaiement(paiement).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Paiement enregistré : ${this.montantTicketModerateur.toLocaleString()} FCFA encaissés`
                });
                // Rediriger vers la réalisation de l'examen
                this.router.navigate(['/laboratoire/realisation', this.examenId]);
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de l\'enregistrement du paiement'
                });
            }
        });
    }
}
