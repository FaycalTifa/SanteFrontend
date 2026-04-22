// consultations-attente.component.ts
import { Component, OnInit } from '@angular/core';
import { Consultation } from '../../../models/consultation';
import { ConsultationService } from '../../../services/consultation/consultation.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-consultations-attente',
    templateUrl: './consultations-attente.component.html',
    styleUrls: ['./consultations-attente.component.scss']
})
export class ConsultationsAttenteComponent implements OnInit {

    consultations: Consultation[] = [];
    filteredConsultations: Consultation[] = [];
    loading = false;

    // Champs de recherche
    searchNumPolice = '';
    searchCodeInte = '';
    searchCodeRisq = '';
    searchCodeMemb = '';

    rechercheEnCours = false;

    constructor(
        private consultationService: ConsultationService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
    }

    loadConsultations(): void {
        this.loading = true;
        this.consultationService.getConsultationsEnAttente().subscribe({
            next: (data) => {
                console.log('=== CONSULTATIONS CHARGÉES ===', data);
                this.consultations = data;
                this.applyFilters();
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les consultations'
                });
            }
        });
    }

    // consultations-attente.component.ts
    rechercher(): void {
        // Récupérer les valeurs
        const numPolice = this.searchNumPolice?.trim() || '';
        const codeInte = this.searchCodeInte?.trim() || '';
        const codeRisq = this.searchCodeRisq?.trim() || '';
        const codeMemb = this.searchCodeMemb?.trim() || '';  // ✅ Récupérer codeMemb

        console.log('=== RECHERCHE ===');
        console.log('numPolice:', numPolice);
        console.log('codeInte:', codeInte);
        console.log('codeRisq:', codeRisq);
        console.log('codeMemb:', codeMemb);

        // ✅ Vérifier que les champs OBLIGATOIRES sont remplis (codeMemb est optionnel)
        if (!numPolice || !codeInte || !codeRisq) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez remplir les champs obligatoires: CODEINTE, N° Police, Code Risque'
            });
            return;
        }

        this.loading = true;
        this.rechercheEnCours = true;

        // ✅ Passer codeMemb seulement s'il est rempli (optionnel)
        this.consultationService.getConsultationsEnAttente(
            numPolice,
            codeInte,
            codeRisq,
            codeMemb || undefined  // undefined pour ne pas envoyer le paramètre
        ).subscribe({
            next: (data) => {
                console.log('=== CONSULTATIONS REÇUES ===', data);
                this.consultations = data;
                this.filteredConsultations = data;
                this.loading = false;
                this.rechercheEnCours = false;

                if (data.length === 0) {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Aucun résultat',
                        detail: 'Aucune consultation trouvée avec ces critères'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Résultats',
                        detail: `${data.length} consultation(s) trouvée(s)`
                    });
                }
            },
            error: (error) => {
                this.loading = false;
                this.rechercheEnCours = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la recherche'
                });
            }
        });
    }

    resetSearch(): void {
        this.searchNumPolice = '';
        this.searchCodeInte = '';
        this.searchCodeRisq = '';
        this.searchCodeMemb = '';  // ✅ Réinitialiser codeMemb
        this.consultations = [];
        this.filteredConsultations = [];

        this.messageService.add({
            severity: 'info',
            summary: 'Filtres réinitialisés',
            detail: 'Veuillez saisir les critères de recherche'
        });
    }

    applyFilters(): void {
        let result = [...this.consultations];

        // Filtre par numéro police
        if (this.searchNumPolice) {
            result = result.filter(c =>
                c.numeroPolice?.toLowerCase().includes(this.searchNumPolice.toLowerCase())
            );
        }

        // Filtre par CODEINTE
        if (this.searchCodeInte) {
            result = result.filter(c =>
                c.codeInte?.toLowerCase().includes(this.searchCodeInte.toLowerCase())
            );
        }

        // Filtre par CODERISQ
        if (this.searchCodeRisq) {
            result = result.filter(c =>
                c.codeRisq?.toString().includes(this.searchCodeRisq.toString())
            );
        }

        this.filteredConsultations = result;
    }

    prescrire(consultation: Consultation): void {
        if (consultation.prescriptionsValidees) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Cette consultation a déjà des prescriptions'
            });
            return;
        }
        this.router.navigate(['/medecin/prescriptions', consultation.id]);
    }
}
