import { Component, OnInit } from '@angular/core';
import {StructureDashboardService} from '../../services/StructureDashboard/structure-dashboard.service';
import {StructureDashboard} from '../../models/StructureDashboard';
import {Router} from '@angular/router';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-structure-dashboard',
  templateUrl: './structure-dashboard.component.html',
  styleUrls: ['./structure-dashboard.component.scss']
})
export class StructureDashboardComponent implements OnInit {

    dashboard: StructureDashboard | null = null;
    loading = false;
    selectedAnnee: number | null = null;
    selectedMois: number | null = null;

    chartData: any;
    chartOptions: any;

    constructor(
        private dashboardService: StructureDashboardService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadDashboard();
        this.initChartOptions();
    }

    loadDashboard(): void {
        this.loading = true;
        console.log('Chargement du dashboard structure...');
        this.dashboardService.getDashboard().subscribe({
            next: (data) => {
                console.log('Dashboard chargé:', data);
                this.dashboard = data;
                this.loading = false;
                this.initChartData();
            },
            error: (error) => {
                this.loading = false;
                console.error('Erreur chargement dashboard:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger le tableau de bord'
                });
            }
        });
    }

    initChartOptions(): void {
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Nombre de dossiers' }
                },
                x: {
                    title: { display: true, text: 'Mois' }
                }
            }
        };
    }

    initChartData(): void {
        if (!this.dashboard?.evolutionMensuelle) { return; }

        const labels = this.dashboard.evolutionMensuelle.map(e => e.mois);
        const dossiersData = this.dashboard.evolutionMensuelle.map(e => e.nombreDossiers);
        const montantData = this.dashboard.evolutionMensuelle.map(e => e.montantTotal / 1000);

        this.chartData = {
            labels,
            datasets: [
                {
                    label: 'Nombre de dossiers',
                    data: dossiersData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Montant (milliers FCFA)',
                    data: montantData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        };

        this.chartOptions.scales = {
            ...this.chartOptions.scales,
            y1: {
                position: 'right',
                title: { display: true, text: 'Montant (milliers FCFA)' }
            }
        };
    }

    // ✅ AJOUTER CETTE MÉTHODE
    getCouleurParType(type: string): string {
        switch (type) {
            case 'HOPITAL': return '#3b82f6';
            case 'CLINIQUE': return '#10b981';
            case 'PHARMACIE': return '#f59e0b';
            case 'LABORATOIRE': return '#8b5cf6';
            default: return '#6b7280';
        }
    }

    // ✅ AJOUTER CETTE MÉTHODE
    getIconeParType(type: string): string {
        switch (type) {
            case 'HOPITAL': return 'pi pi-building';
            case 'CLINIQUE': return 'pi pi-heart';
            case 'PHARMACIE': return 'pi pi-shopping-cart';
            case 'LABORATOIRE': return 'pi pi-flask';
            default: return 'pi pi-question';
        }
    }

    getCouleurStatut(statut: string): string {
        switch (statut) {
            case 'PAYEE_CAISSE': return '#f59e0b';
            case 'PRESCRIPTIONS_FAITES': return '#8b5cf6';
            case 'COMPLET': return '#3b82f6';
            case 'VALIDEE_UAB': return '#10b981';
            case 'REJETEE': return '#ef4444';
            default: return '#6b7280';
        }
    }

    voirDetailConsultation(id: number): void {
        this.router.navigate(['/uab/validation', id]);
    }
}
