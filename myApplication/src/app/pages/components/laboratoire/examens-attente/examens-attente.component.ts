// examens-attente.component.ts
import { Component, OnInit } from '@angular/core';
import { PrescriptionExamen } from '../../../models/prescription';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LaboratoireService } from '../../../services/laboratoire/laboratoire.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
    selector: 'app-examens-attente',
    templateUrl: './examens-attente.component.html',
    styleUrls: ['./examens-attente.component.scss']
})
export class ExamensAttenteComponent implements OnInit {

    examens: PrescriptionExamen[] = [];
    filteredExamens: PrescriptionExamen[] = [];
    loading = false;
    rechercheEnCours = false;

    searchNumPolice = '';
    searchCodeInte = '';
    searchCodeRisq = '';
    searchCodeMemb = '';

    // Sauvegarde des critères de recherche
    lastSearchCriteria = {
        numPolice: '',
        codeInte: '',
        codeRisq: '',
        codeMemb: ''
    };

    currentUser: any;
    isBiologiste = false;
    isCaissier = false;

    // Regrouper par consultation
    consultationsMap: Map<number, {
        consultation: any,
        examens: PrescriptionExamen[],
        totalExamens: number,
        payeCount: number,
        realiseCount: number,
        valideCount: number
    }> = new Map();

    selectedConsultationId: number | null = null;

    constructor(
        private laboratoireService: LaboratoireService,
        private router: Router,
        private messageService: MessageService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        const userRoles = this.currentUser?.roles || [];
        this.isBiologiste = userRoles.includes('BIOLOGISTE');
        this.isCaissier = userRoles.includes('CAISSIER_LABORATOIRE');

        console.log('=== EXAMENS ATTENTE INIT ===');
        console.log('isCaissier:', this.isCaissier);
        console.log('isBiologiste:', this.isBiologiste);

        // ✅ CHARGER LES CRITÈRES SAUVEGARDÉS
        this.loadSavedSearchCriteria();
    }

    /**
     * ✅ Sauvegarder les critères de recherche dans sessionStorage
     */
    private saveSearchCriteria(): void {
        const criteria = {
            numPolice: this.searchNumPolice,
            codeInte: this.searchCodeInte,
            codeRisq: this.searchCodeRisq,
            codeMemb: this.searchCodeMemb
        };
        sessionStorage.setItem('laboratoire_search_criteria', JSON.stringify(criteria));
        console.log('✅ Critères laboratoire sauvegardés:', criteria);
    }

    /**
     * ✅ Charger les critères de recherche sauvegardés
     */
    private loadSavedSearchCriteria(): void {
        const saved = sessionStorage.getItem('laboratoire_search_criteria');
        if (saved) {
            try {
                const criteria = JSON.parse(saved);
                this.searchNumPolice = criteria.numPolice || '';
                this.searchCodeInte = criteria.codeInte || '';
                this.searchCodeRisq = criteria.codeRisq || '';
                this.searchCodeMemb = criteria.codeMemb || '';
                console.log('✅ Critères laboratoire chargés:', criteria);

                // ✅ Si des critères existent, lancer automatiquement la recherche
                if (this.searchNumPolice && this.searchCodeInte && this.searchCodeRisq) {
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
        sessionStorage.removeItem('laboratoire_search_criteria');
    }

    rechercher(): void {
        const numPolice = this.searchNumPolice?.trim() || '';
        const codeInteVal = this.searchCodeInte?.trim() || '';
        const codeRisqVal = this.searchCodeRisq?.trim() || '';
        const codeMembVal = this.searchCodeMemb?.trim() || '';

        console.log('=== RECHERCHE LABORATOIRE ===');
        console.log('numPolice:', numPolice);
        console.log('codeInte:', codeInteVal);
        console.log('codeRisq:', codeRisqVal);
        console.log('codeMemb:', codeMembVal);

        if (!numPolice || !codeInteVal || !codeRisqVal) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Attention',
                detail: 'Veuillez remplir les champs obligatoires: CODEINTE, N° Police, Code Risque'
            });
            return;
        }

        // Sauvegarder les critères
        this.lastSearchCriteria = {
            numPolice,
            codeInte: codeInteVal,
            codeRisq: codeRisqVal,
            codeMemb: codeMembVal
        };

        // ✅ Sauvegarder dans sessionStorage
        this.saveSearchCriteria();

        this.loading = true;
        this.rechercheEnCours = true;

        this.laboratoireService.rechercherParCriteres(numPolice, codeInteVal, codeRisqVal, codeMembVal || undefined).subscribe({
            next: (data) => {
                console.log('=== EXAMENS REÇUS ===', data);
                this.examens = data;
                this.groupByConsultation();
                this.loading = false;
                this.rechercheEnCours = false;

                if (data.length === 0) {
                    this.messageService.add({
                        severity: 'info',
                        summary: '📋 Aucun résultat',
                        detail: 'Aucun examen trouvé avec ces critères.',
                        life: 3000
                    });
                } else {
                    const aPayer = data.filter(e => e.validationUab === 'OUI' && !e.paye).length;
                    this.messageService.add({
                        severity: 'success',
                        summary: '✅ Résultats',
                        detail: `${data.length} examen(s) trouvé(s) | ${aPayer} à payer`,
                        life: 4000
                    });
                }
            },
            error: (error) => {
                this.loading = false;
                this.rechercheEnCours = false;
                this.messageService.add({
                    severity: 'error',
                    summary: '❌ Erreur',
                    detail: 'Erreur lors de la recherche.',
                    life: 5000
                });
            }
        });
    }

    resetSearch(): void {
        this.searchNumPolice = '';
        this.searchCodeInte = '';
        this.searchCodeRisq = '';
        this.searchCodeMemb = '';
        this.examens = [];
        this.filteredExamens = [];
        this.consultationsMap.clear();
        this.selectedConsultationId = null;
        this.lastSearchCriteria = { numPolice: '', codeInte: '', codeRisq: '', codeMemb: '' };

        // ✅ Effacer les critères sauvegardés
        this.clearSavedSearchCriteria();

        this.messageService.add({
            severity: 'info',
            summary: '🔄 Filtres réinitialisés',
            detail: 'Veuillez saisir les critères de recherche.',
            life: 3000
        });
    }

    groupByConsultation(): void {
        this.consultationsMap.clear();

        this.examens.forEach(examen => {
            const consultationId = examen.consultationId;
            if (!consultationId) { return; }

            if (!this.consultationsMap.has(consultationId)) {
                this.consultationsMap.set(consultationId, {
                    consultation: {
                        id: consultationId,
                        numeroFeuille: examen.consultationNumeroFeuille,
                        patientNom: examen.patientNom,
                        patientPrenom: examen.patientPrenom,
                        patientPolice: examen.patientPolice,
                        codeInte: examen.codeInte,
                        codeRisq: examen.codeRisq
                    },
                    examens: [],
                    totalExamens: 0,
                    payeCount: 0,
                    realiseCount: 0,
                    valideCount: 0
                });
            }
            const group = this.consultationsMap.get(consultationId)!;
            group.examens.push(examen);
            group.totalExamens++;
            if (examen.paye) { group.payeCount++; }
            if (examen.realise) { group.realiseCount++; }
            if (examen.validationUab === 'OUI') { group.valideCount++; }
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

    getNonPayeCount(group: any): number {
        return group.totalExamens - group.payeCount;
    }

    getNonRealiseCount(group: any): number {
        return group.payeCount - group.realiseCount;
    }

    getEnAttenteCount(group: any): number {
        return group.totalExamens - group.valideCount;
    }

    payer(examen: PrescriptionExamen): void {
        if (examen.validationUab !== 'OUI') {
            this.messageService.add({
                severity: 'error',
                summary: '⛔ Validation UAB requise',
                detail: 'Cet examen n\'a pas été validé par l\'UAB. Paiement impossible.',
                life: 5000
            });
            return;
        }

        if (examen.paye) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Déjà payé',
                detail: 'Cet examen a déjà été payé.',
                life: 3000
            });
            return;
        }

        this.router.navigate(['/laboratoire/caisse', examen.id]);
    }

    realiser(examen: PrescriptionExamen): void {
        if (examen.validationUab !== 'OUI') {
            this.messageService.add({
                severity: 'error',
                summary: '⛔ Validation UAB requise',
                detail: 'Cet examen n\'a pas été validé par l\'UAB. Réalisation impossible.',
                life: 5000
            });
            return;
        }

        if (!examen.paye) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Paiement requis',
                detail: 'Cet examen doit d\'abord être payé avant réalisation.',
                life: 3000
            });
            return;
        }

        if (examen.realise) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Déjà réalisé',
                detail: 'Cet examen a déjà été réalisé.',
                life: 3000
            });
            return;
        }

        this.router.navigate(['/laboratoire/realisation', examen.id]);
    }

    contacterUAB(examen?: PrescriptionExamen): void {
        let message = 'Demande de validation d\'examen\n';
        if (examen) {
            message += `Examen: ${examen.examenNom}\n`;
            message += `Patient: ${examen.patientPrenom} ${examen.patientNom}\n`;
            message += `Police: ${examen.patientPolice}\n`;
            message += `CODEINTE: ${examen.codeInte}\n`;
            message += `Code Risque: ${examen.codeRisq}`;
        } else {
            message += `CODEINTE: ${this.searchCodeInte}\n`;
            message += `N° Police: ${this.searchNumPolice}\n`;
            message += `Code Risque: ${this.searchCodeRisq}`;
        }

        navigator.clipboard.writeText(message).then(() => {
            this.messageService.add({
                severity: 'success',
                summary: '📋 Informations copiées',
                detail: 'Les informations ont été copiées. Contactez l\'UAB pour validation.',
                life: 5000
            });
        });

        this.messageService.add({
            severity: 'info',
            summary: '📞 Contacter l\'UAB',
            detail: 'Contactez l\'administrateur UAB par email: admin@uab.ci',
            life: 8000,
            sticky: true
        });
    }

    getValidationStatusClass(validationUab: string): string {
        if (validationUab === 'OUI') { return 'status-validated'; }
        if (validationUab === 'EN_ATTENTE') { return 'status-pending'; }
        if (validationUab === 'NON') { return 'status-rejected'; }
        return 'status-unknown';
    }

    getValidationLabel(validationUab: string): string {
        if (validationUab === 'OUI') { return '✅ Validé UAB'; }
        if (validationUab === 'EN_ATTENTE') { return '⏳ En attente validation UAB'; }
        if (validationUab === 'NON') { return '❌ Rejeté par UAB'; }
        return '❓ Statut inconnu';
    }

    getValidationIcon(validationUab: string): string {
        if (validationUab === 'OUI') { return 'pi pi-check-circle'; }
        if (validationUab === 'EN_ATTENTE') { return 'pi pi-clock'; }
        if (validationUab === 'NON') { return 'pi pi-times-circle'; }
        return 'pi pi-question-circle';
    }
}
