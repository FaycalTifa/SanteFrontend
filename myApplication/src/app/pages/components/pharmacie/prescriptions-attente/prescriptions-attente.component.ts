import { Component, OnInit } from '@angular/core';
import { PrescriptionMedicament } from '../../../models/prescription';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PharmacieService } from "../../../services/pharmacie/pharmacie.service";

@Component({
    selector: 'app-prescriptions-attente',
    templateUrl: './prescriptions-attente.component.html',
    styleUrls: ['./prescriptions-attente.component.scss']
})
export class PrescriptionsAttenteComponent implements OnInit {

    prescriptions: PrescriptionMedicament[] = [];
    filteredPrescriptions: PrescriptionMedicament[] = [];
    loading = false;
    searchPolice = '';
    selectedPrescription: any = null;
    displayDialog = false;
    prixUnitaire = 0;
    quantiteDelivree = 0;

    filterOptions = [
        { label: '📋 Tous', value: 'all' },
        { label: '⏳ En attente', value: 'pending' },
        { label: '✅ Délivrés', value: 'delivered' }
    ];
    currentFilter = 'all';

    constructor(
        private pharmacieService: PharmacieService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadAllPrescriptions();
    }

    loadAllPrescriptions(): void {
        this.loading = true;
        this.pharmacieService.getAllPrescriptions().subscribe({
            next: (data) => {
                console.log('=== TOUTES LES PRESCRIPTIONS ===');
                console.log('Nombre total:', data.length);
                this.prescriptions = data;
                this.applyFilters();
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                console.error('Erreur chargement:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les prescriptions'
                });
            }
        });
    }

    searchByPolice(): void {
        if (this.searchPolice.trim()) {
            this.loading = true;
            this.pharmacieService.getPrescriptionsByPolice(this.searchPolice).subscribe({
                next: (data) => {
                    console.log('=== PRESCRIPTIONS PAR POLICE ===');
                    console.log('Police:', this.searchPolice);
                    console.log('Nombre:', data.length);
                    this.prescriptions = data;
                    this.applyFilters();
                    this.loading = false;
                },
                error: (error) => {
                    this.loading = false;
                    console.error('Erreur recherche:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de rechercher les prescriptions'
                    });
                }
            });
        } else {
            this.loadAllPrescriptions();
        }
    }

    resetSearch(): void {
        this.searchPolice = '';
        this.currentFilter = 'all';
        this.loadAllPrescriptions();
    }

    applyFilters(): void {
        let result = [...this.prescriptions];

        if (this.searchPolice.trim()) {
            result = result.filter(p => {
                const police = p.patientPolice || '';
                return police.toLowerCase().includes(this.searchPolice.toLowerCase());
            });
        }

        if (this.currentFilter === 'delivered') {
            result = result.filter(p => p.delivre === true);
        } else if (this.currentFilter === 'pending') {
            result = result.filter(p => p.delivre === false);
        }

        this.filteredPrescriptions = result;
        console.log(`Filtre appliqué: ${this.currentFilter} - ${this.filteredPrescriptions.length} prescriptions`);
    }

    onFilterChange(value: string): void {
        this.currentFilter = value;
        this.applyFilters();
    }

    // ✅ Méthodes pour le dialogue avec taux réel
    getTauxCouverture(): number {
        if (this.selectedPrescription?.tauxCouverture) {
            return this.selectedPrescription.tauxCouverture;
        }
        if (this.selectedPrescription?.prixTotal && this.selectedPrescription?.montantPrisEnCharge && this.selectedPrescription.prixTotal > 0) {
            return (this.selectedPrescription.montantPrisEnCharge / this.selectedPrescription.prixTotal) * 100;
        }
        return 80;
    }

    getPrixTotal(): number {
        const quantite = this.quantiteDelivree || this.selectedPrescription?.quantitePrescitee || 0;
        return this.prixUnitaire * quantite;
    }

    getMontantUAB(): number {
        const prixTotal = this.getPrixTotal();
        const taux = this.getTauxCouverture();
        return prixTotal * (taux / 100);
    }

    getMontantPatient(): number {
        const prixTotal = this.getPrixTotal();
        const montantUAB = this.getMontantUAB();
        return prixTotal - montantUAB;
    }

    delivrer(prescription: PrescriptionMedicament): void {
        if (prescription.delivre) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Ce médicament a déjà été délivré'
            });
            return;
        }

        this.selectedPrescription = prescription;
        this.prixUnitaire = 0;
        this.quantiteDelivree = prescription.quantitePrescitee;
        this.displayDialog = true;
    }

    fermerDialogue(): void {
        this.displayDialog = false;
        this.selectedPrescription = null;
        this.prixUnitaire = 0;
        this.quantiteDelivree = 0;
    }

    confirmerDelivrance(): void {
        if (!this.prixUnitaire || this.prixUnitaire <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez saisir un prix unitaire valide'
            });
            return;
        }

        if (this.quantiteDelivree > this.selectedPrescription.quantitePrescitee) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'La quantité délivrée ne peut pas dépasser la quantité prescrite'
            });
            return;
        }

        this.loading = true;

        const montantPatient = this.getMontantPatient();

        this.pharmacieService.delivrerMedicament({
            prescriptionId: this.selectedPrescription.id,
            prixUnitaire: this.prixUnitaire,
            quantiteDelivree: this.quantiteDelivree || this.selectedPrescription.quantitePrescitee
        }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Médicament délivré avec succès. Montant encaissé: ${montantPatient.toLocaleString()} FCFA`
                });
                this.fermerDialogue();
                if (this.searchPolice.trim()) {
                    this.searchByPolice();
                } else {
                    this.loadAllPrescriptions();
                }
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
