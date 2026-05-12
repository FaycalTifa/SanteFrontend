// pages/components/medecin/demandes-attente/demandes-attente.component.ts
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { PrescriptionExamen } from '../../../models/prescription';
import { MedecinService } from '../../../services/medecin/medecin.service';

@Component({
    selector: 'app-demandes-attente',
    templateUrl: './demandes-attente.component.html',
    styleUrls: ['./demandes-attente.component.scss']
})
export class DemandesAttenteComponent implements OnInit {

    demandes: PrescriptionExamen[] = [];
    filteredDemandes: PrescriptionExamen[] = [];
    loading = false;
    rechercheEnCours = false;

    // Champs de recherche
    searchNumPolice = '';
    searchCodeInte = '';
    searchCodeRisq = '';
    searchCodeMemb  = '';

    constructor(
        private medecinService: MedecinService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        // Ne pas charger automatiquement
    }

    /**
     * Rechercher TOUS les examens ayant une demande de validation UAB
     */
    // pages/components/medecin/demandes-attente/demandes-attente.component.ts

    rechercher(): void {
        const hasNumPolice = this.searchNumPolice?.trim() !== '';
        const hasCodeInte = this.searchCodeInte?.trim() !== '';
        const hasCodeRisq = this.searchCodeRisq?.trim() !== '';
        const codeMembVal = this.searchCodeMemb?.trim() || '';

        console.log('=== RECHERCHE DEMANDES VALIDATION ===');
        console.log('numPolice:', this.searchNumPolice);
        console.log('codeInte:', this.searchCodeInte);
        console.log('codeRisq:', this.searchCodeRisq);
        console.log('codeMemb:', codeMembVal);

        if (!hasNumPolice || !hasCodeInte || !hasCodeRisq) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Attention',
                detail: 'Veuillez remplir les champs obligatoires: CODEINTE, N° Police, Code Risque'
            });
            return;
        }

        this.loading = true;
        this.rechercheEnCours = true;

        this.medecinService.getDemandesValidation(
            this.searchNumPolice,
            this.searchCodeInte,
            this.searchCodeRisq,
            codeMembVal || undefined
        ).subscribe({
            next: (data) => {
                console.log('=== DEMANDES DE VALIDATION REÇUES ===', data);

                // ✅ TRIER DU PLUS RÉCENT AU PLUS VIEUX (datePrescription décroissante)
                const sortedData = [...data].sort((a, b) => {
                    const dateA = new Date(a.datePrescription).getTime();
                    const dateB = new Date(b.datePrescription).getTime();
                    return dateB - dateA; // Plus récent d'abord
                });

                this.demandes = sortedData;
                this.filteredDemandes = sortedData;
                this.loading = false;
                this.rechercheEnCours = false;

                // Statistiques
                const enAttente = data.filter(d => d.validationUab === 'EN_ATTENTE').length;
                const valides = data.filter(d => d.validationUab === 'OUI').length;
                const rejetes = data.filter(d => d.validationUab === 'NON').length;

                if (data.length === 0) {
                    this.messageService.add({
                        severity: 'info',
                        summary: '📋 Aucun résultat',
                        detail: 'Aucune demande de validation d\'examen trouvée avec ces critères.'
                    });
                } else {
                    let message = `${data.length} demande(s) de validation trouvée(s) :\n`;
                    if (enAttente > 0) { message += `⏳ ${enAttente} en attente\n`; }
                    if (valides > 0) { message += `✅ ${valides} validée(s)\n`; }
                    if (rejetes > 0) { message += `❌ ${rejetes} rejetée(s)`; }

                    this.messageService.add({
                        severity: 'success',
                        summary: '📊 Résultats',
                        detail: message,
                        life: 5000
                    });
                }
            },
            error: (error) => {
                this.loading = false;
                this.rechercheEnCours = false;
                console.error('Erreur recherche:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: '❌ Erreur',
                    detail: 'Erreur lors de la recherche des demandes.'
                });
            }
        });
    }

    /**
     * Réinitialiser les filtres
     */
    resetSearch(): void {
        this.searchNumPolice = '';
        this.searchCodeInte = '';
        this.searchCodeRisq = '';
        this.searchCodeMemb = '';  // ✅ Réinitialiser codeMemb
        this.demandes = [];
        this.filteredDemandes = [];

        this.messageService.add({
            severity: 'info',
            summary: '🔄 Filtres réinitialisés',
            detail: 'Veuillez saisir les critères de recherche.'
        });
    }

    /**
     * Consulter la consultation (pas de paiement)
     */
    consulterConsultation(demande: PrescriptionExamen): void {
        if (demande.consultationId) {
            this.router.navigate(['/medecin/consultation', demande.consultationId]);
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Attention',
                detail: 'Impossible d\'afficher le détail de la consultation.'
            });
        }
    }

    /**
     * Contacter l'UAB
     */
    contacterUAB(demande?: PrescriptionExamen): void {
        let message = 'Demande de validation d\'examen\n';
        if (demande) {
            message += `Examen: ${demande.examenNom}\n`;
            message += `Patient: ${demande.patientPrenom} ${demande.patientNom}\n`;
            message += `Police: ${demande.patientPolice}\n`;
            message += `CODEINTE: ${demande.codeInte}\n`;
            message += `Code Risque: ${demande.codeRisq}\n`;
            message += `Statut actuel: ${this.getStatusLabel(demande.validationUab)}\n`;
           // message += `Date prescription: ${new Date(demande.datePrescription).toLocaleDateString()}`;
        } else {
            message += `CODEINTE: ${this.searchCodeInte}\n`;
            message += `N° Police: ${this.searchNumPolice}\n`;
            message += `Code Risque: ${this.searchCodeRisq}`;
        }

        navigator.clipboard.writeText(message).then(() => {
            this.messageService.add({
                severity: 'success',
                summary: '📋 Informations copiées',
                detail: 'Les informations ont été copiées. Contactez l\'UAB pour plus d\'informations.',
                life: 5000
            });
        });

        this.messageService.add({
            severity: 'info',
            summary: '📞 Contacter l\'UAB',
            detail: 'Email: admin@uab.ci | Tél: +225 XX XXX XXX',
            life: 8000,
            sticky: true
        });
    }

    /**
     * Obtenir la classe CSS du statut
     */
    getStatusClass(validationUab: string): string {
        switch (validationUab) {
            case 'EN_ATTENTE': return 'status-pending';
            case 'OUI': return 'status-validated';
            case 'NON': return 'status-rejected';
            default: return 'status-unknown';
        }
    }

    /**
     * Obtenir l'icône du statut
     */
    getStatusIcon(validationUab: string): string {
        switch (validationUab) {
            case 'EN_ATTENTE': return 'pi pi-clock';
            case 'OUI': return 'pi pi-check-circle';
            case 'NON': return 'pi pi-times-circle';
            default: return 'pi pi-question-circle';
        }
    }

    /**
     * Obtenir le libellé du statut
     */
    getStatusLabel(validationUab: string): string {
        switch (validationUab) {
            case 'EN_ATTENTE': return 'En attente de validation UAB';
            case 'OUI': return 'Validé par UAB';
            case 'NON': return 'Rejeté par UAB';
            default: return 'Statut inconnu';
        }
    }

    /**
     * Obtenir le message détaillé selon le statut
     */
    getStatusMessage(validationUab: string, motifRejet?: string): string {
        switch (validationUab) {
            case 'EN_ATTENTE':
                return '⏳ Cette demande est en attente de validation par l\'UAB. Vous serez informé dès qu\'une décision sera prise.';
            case 'OUI':
                return '✅ Cette demande a été validée par l\'UAB. L\'examen peut maintenant être réalisé par le laboratoire.';
            case 'NON':
                return `❌ Cette demande a été rejetée par l\'UAB. Motif : ${motifRejet || 'Non spécifié'}`;
            default:
                return '❓ Le statut de cette demande est inconnu. Veuillez contacter l\'UAB.';
        }
    }

    /**
     * Obtenir la couleur de fond du statut
     */
    getStatusBgColor(validationUab: string): string {
        switch (validationUab) {
            case 'EN_ATTENTE': return '#fef3c7';
            case 'OUI': return '#d1fae5';
            case 'NON': return '#fee2e2';
            default: return '#f1f5f9';
        }
    }

    /**
     * Obtenir la couleur du texte du statut
     */
    getStatusTextColor(validationUab: string): string {
        switch (validationUab) {
            case 'EN_ATTENTE': return '#d97706';
            case 'OUI': return '#059669';
            case 'NON': return '#dc2626';
            default: return '#64748b';
        }
    }
}
