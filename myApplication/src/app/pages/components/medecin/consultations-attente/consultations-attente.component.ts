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
    searchPolice = '';

    // Filtres
    filterOptions = [
        { label: 'Tous', value: 'all' },
        { label: 'En attente de prescription', value: 'pending' },
        { label: 'Prescrites', value: 'done' }
    ];
    currentFilter = 'all';

    constructor(
        private consultationService: ConsultationService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadConsultations();
    }

    loadConsultations(): void {
        this.loading = true;
        this.consultationService.getConsultationsEnAttente().subscribe({
            next: (data) => {
                console.log('=== CONSULTATIONS CHARGÉES ===');
                console.log('Données:', data);
                console.log('Statut prescription de chaque consultation:');
                data.forEach(c => {
                    console.log(`  - Consultation ${c.id}: prescriptionsValidees = ${c.prescriptionsValidees}`);
                });

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

    searchByPolice(): void {
        if (this.searchPolice.trim()) {
            this.loading = true;
            this.consultationService.getByPolice(this.searchPolice).subscribe({
                next: (data) => {
                    this.consultations = data;
                    this.applyFilters();
                    this.loading = false;
                },
                error: (error) => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de rechercher'
                    });
                }
            });
        } else {
            this.loadConsultations();
        }
    }

    resetSearch(): void {
        this.searchPolice = '';
        this.currentFilter = 'all';
        this.loadConsultations();
    }

    applyFilters(): void {
        let result = [...this.consultations];

        // Filtre par recherche
        if (this.searchPolice.trim()) {
            result = result.filter(c =>
                c.numeroPolice?.toLowerCase().includes(this.searchPolice.toLowerCase())
            );
        }

        // Filtre par statut de prescription
        if (this.currentFilter === 'done') {
            result = result.filter(c => c.prescriptionsValidees === true);
        } else if (this.currentFilter === 'pending') {
            result = result.filter(c => c.prescriptionsValidees === false);
        }

        this.filteredConsultations = result;
    }

    onFilterChange(value: string): void {
        this.currentFilter = value;
        this.applyFilters();
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
