// prescriptions-attente.component.ts
import { Component, OnInit } from '@angular/core';
import { PharmacieService } from '../../../services/pharmacie/pharmacie.service';
import { PrescriptionMedicament } from '../../../models/prescription';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
    selector: 'app-prescriptions-attente',
    templateUrl: './prescriptions-attente.component.html',
    styleUrls: ['./prescriptions-attente.component.scss']
})
export class PrescriptionsAttenteComponent implements OnInit {

    prescriptions: PrescriptionMedicament[] = [];
    filteredPrescriptions: PrescriptionMedicament[] = [];
    loading = false;

    // Champs de recherche
    numeroPolice = '';
    codeInte = '';
    codeRisq = '';
    codeMemb = '';

    rechercheEnCours = false;

    // Consultation sélectionnée pour afficher les détails
    selectedConsultationId: number | null = null;

    // Regrouper par consultation
    consultationsMap: Map<number, {
        consultation: any,
        prescriptions: PrescriptionMedicament[],
        totalMedicaments: number,
        delivreCount: number
    }> = new Map();

    constructor(
        private pharmacieService: PharmacieService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        // ✅ CHARGER LES CRITÈRES SAUVEGARDÉS
        this.loadSavedSearchCriteria();

        this.messageService.add({
            severity: 'info',
            summary: 'Bienvenue',
            detail: 'Veuillez saisir les trois critères de recherche (CODEINTE, N° Police, Code Risque)'
        });
    }

    /**
     * ✅ Sauvegarder les critères de recherche dans sessionStorage
     */
    private saveSearchCriteria(): void {
        const criteria = {
            numeroPolice: this.numeroPolice,
            codeInte: this.codeInte,
            codeRisq: this.codeRisq,
            codeMemb: this.codeMemb
        };
        sessionStorage.setItem('pharmacie_search_criteria', JSON.stringify(criteria));
        console.log('✅ Critères sauvegardés:', criteria);
    }

    /**
     * ✅ Charger les critères de recherche sauvegardés
     */
    private loadSavedSearchCriteria(): void {
        const saved = sessionStorage.getItem('pharmacie_search_criteria');
        if (saved) {
            try {
                const criteria = JSON.parse(saved);
                this.numeroPolice = criteria.numeroPolice || '';
                this.codeInte = criteria.codeInte || '';
                this.codeRisq = criteria.codeRisq || '';
                this.codeMemb = criteria.codeMemb || '';
                console.log('✅ Critères chargés:', criteria);

                // ✅ Si des critères existent, lancer automatiquement la recherche
                if (this.numeroPolice && this.codeInte && this.codeRisq) {
                    setTimeout(() => {
                        this.rechercher();
                    }, 500);
                }
            } catch (e) {
                console.error('Erreur chargement critères:', e);
            }
        }
    }

    /**
     * ✅ Effacer les critères sauvegardés
     */
    private clearSavedSearchCriteria(): void {
        sessionStorage.removeItem('pharmacie_search_criteria');
    }

    rechercher(): void {
        const numPolice = this.numeroPolice?.trim() || '';
        const codeInteVal = this.codeInte?.trim() || '';
        const codeRisqVal = this.codeRisq?.trim() || '';
        const codeMembVal = this.codeMemb?.trim() || '';

        console.log('=== RECHERCHE PHARMACIE ===');
        console.log('numPolice:', numPolice);
        console.log('codeInte:', codeInteVal);
        console.log('codeRisq:', codeRisqVal);
        console.log('codeMemb:', codeMembVal);

        if (!numPolice || !codeInteVal || !codeRisqVal) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Champs obligatoires',
                detail: 'Veuillez remplir les trois champs : CODEINTE, N° Police et Code Risque',
                life: 5000
            });
            return;
        }

        // ✅ Sauvegarder les critères avant recherche
        this.saveSearchCriteria();

        this.loading = true;
        this.rechercheEnCours = true;

        this.pharmacieService.rechercherParPoliceEtCodeInte(numPolice, codeInteVal, codeRisqVal, codeMembVal || undefined).subscribe({
            next: (data) => {
                console.log('✅ Prescriptions reçues:', data);
                this.prescriptions = data;
                this.groupByConsultation();
                this.loading = false;
                this.rechercheEnCours = false;

                if (data.length === 0) {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Aucun résultat',
                        detail: 'Aucune prescription trouvée avec ces critères',
                        life: 3000
                    });
                } else {
                    const totalMedicaments = this.prescriptions.length;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Résultats',
                        detail: `${totalMedicaments} médicament(s) à délivrer pour ${this.consultationsMap.size} consultation(s)`,
                        life: 4000
                    });
                }
            },
            error: (error) => {
                this.loading = false;
                this.rechercheEnCours = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de la recherche'
                });
            }
        });
    }

    resetSearch(): void {
        this.numeroPolice = '';
        this.codeInte = '';
        this.codeRisq = '';
        this.codeMemb = '';
        this.prescriptions = [];
        this.filteredPrescriptions = [];
        this.consultationsMap.clear();
        this.selectedConsultationId = null;

        // ✅ Effacer les critères sauvegardés
        this.clearSavedSearchCriteria();

        this.messageService.add({
            severity: 'info',
            summary: 'Filtres réinitialisés',
            detail: 'Veuillez saisir les trois critères de recherche',
            life: 3000
        });
    }

    groupByConsultation(): void {
        this.consultationsMap.clear();

        this.prescriptions.forEach(prescription => {
            const consultationId = prescription.consultationId || prescription.consultation?.id;
            if (!consultationId) return;

            const consultationData = prescription.consultation;

            if (!this.consultationsMap.has(consultationId)) {
                this.consultationsMap.set(consultationId, {
                    consultation: {
                        id: consultationId,
                        numeroFeuille: consultationData?.numeroFeuille,
                        numeroPolice: prescription.patientPolice || consultationData?.numeroPolice,
                        nomPatient: prescription.patientNom || consultationData?.nomPatient,
                        prenomPatient: prescription.patientPrenom || consultationData?.prenomPatient,
                        dateConsultation: consultationData?.dateConsultation
                    },
                    prescriptions: [],
                    totalMedicaments: 0,
                    delivreCount: 0
                });
            }
            const group = this.consultationsMap.get(consultationId)!;
            group.prescriptions.push(prescription);
            group.totalMedicaments++;
            if (prescription.delivre) {
                group.delivreCount++;
            }
        });
    }

    getConsultationsList(): any[] {
        return Array.from(this.consultationsMap.values());
    }

    toggleConsultation(consultationId: number): void {
        if (this.selectedConsultationId === consultationId) {
            this.selectedConsultationId = null;
        } else {
            this.selectedConsultationId = consultationId;
        }
    }

    isConsultationExpanded(consultationId: number): boolean {
        return this.selectedConsultationId === consultationId;
    }

    getNonDelivreCount(group: any): number {
        return group.totalMedicaments - group.delivreCount;
    }

    redirigerVersDelivrance(prescription: PrescriptionMedicament): void {
        if (prescription.delivre) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Déjà délivré',
                detail: 'Ce médicament a déjà été délivré',
                life: 3000
            });
            return;
        }

        console.log('Redirection vers délivrance pour prescription ID:', prescription.id);
        this.router.navigate(['/pharmacie/delivrance', prescription.id]);
    }

    getTotalMedicaments(): number {
        return this.prescriptions.length;
    }
}
