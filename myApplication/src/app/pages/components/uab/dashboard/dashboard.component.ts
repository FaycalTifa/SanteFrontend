import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { UabService } from '../../../services/uab/uab.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    stats: any = null;
    loading = false;
    selectedStructure: string | null = null;
    selectedAnnee: number | null = null;
    selectedMois: number | null = null;

    chartData: any;
    chartOptions: any;

    // Groupe de structures
    groupedStructures: any[] = [];

    // ✅ Propriétés pour le filtre de recherche
    filteredGroupedStructures: any[] = [];
    searchStructureTerm = '';

    // Configuration des groupes
    structureGroups = [
        {
            type: 'HOPITAL',
            label: '🏥 Hôpitaux',
            icon: 'pi pi-building',
            color: '#3b82f6'
        },
        {
            type: 'CLINIQUE',
            label: '🏥 Cliniques',
            icon: 'pi pi-heart',
            color: '#10b981'
        },
        {
            type: 'PHARMACIE',
            label: '💊 Pharmacies',
            icon: 'pi pi-shopping-cart',
            color: '#f59e0b'
        },
        {
            type: 'LABORATOIRE',
            label: '🔬 Laboratoires',
            icon: 'pi pi-flask',
            color: '#8b5cf6'
        },
        {
            type: 'AUTRE',
            label: '📋 Autres structures',
            icon: 'pi pi-building',
            color: '#6b7280'
        }
    ];

    constructor(
        private uabService: UabService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadDashboard();
        this.initChartOptions();
    }

    loadDashboard(): void {
        this.loading = true;
        this.uabService.getDashboard().subscribe({
            next: (data) => {
                this.stats = data;
                this.loading = false;
                this.initChartData();
                this.groupStructuresByType();
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

    // Méthode pour regrouper les structures par type
    groupStructuresByType(): void {
        if (!this.stats || !this.stats.structures) { return; }

        const groups = [];

        for (const groupConfig of this.structureGroups) {
            const structures = this.stats.structures.filter(
                (s: any) => s.structureType === groupConfig.type
            );

            if (structures.length > 0) {
                groups.push({
                    ...groupConfig,
                    structures
                });
            }
        }

        // Ajouter les structures de type non défini
        const autres = this.stats.structures.filter(
            (s: any) => !this.structureGroups.some(g => g.type === s.structureType)
        );

        if (autres.length > 0) {
            groups.push({
                type: 'AUTRE',
                label: '📋 Autres structures',
                icon: 'pi pi-building',
                color: '#6b7280',
                structures: autres
            });
        }

        this.groupedStructures = groups;
        this.filteredGroupedStructures = [...groups];
        console.log('Structures regroupées:', this.groupedStructures);
    }

    // ✅ Filtrer les structures par nom
    filterStructures(): void {
        if (!this.searchStructureTerm.trim()) {
            this.filteredGroupedStructures = [...this.groupedStructures];
            return;
        }

        const searchTerm = this.searchStructureTerm.toLowerCase().trim();

        this.filteredGroupedStructures = this.groupedStructures
            .map(group => ({
                ...group,
                structures: group.structures.filter((structure: any) =>
                    structure.structureNom?.toLowerCase().includes(searchTerm)
                )
            }))
            .filter(group => group.structures.length > 0);
    }

    // ✅ Effacer la recherche
    clearSearch(): void {
        this.searchStructureTerm = '';
        this.filteredGroupedStructures = [...this.groupedStructures];
    }

    // ✅ Obtenir le nombre total de structures après filtrage
    getTotalStructuresCount(): number {
        return this.filteredGroupedStructures.reduce(
            (total, group) => total + group.structures.length, 0
        );
    }

    // Calculer le total des dossiers pour un groupe
    getGroupTotalDossiers(structures: any[]): number {
        if (!structures) { return 0; }
        return structures.reduce((sum, s) => sum + (s.totalDossiers || 0), 0);
    }

    // Calculer le montant total pour un groupe
    getGroupMontantTotal(structures: any[]): number {
        if (!structures) { return 0; }
        return structures.reduce((sum, s) => sum + (s.montantTotal || 0), 0);
    }

    initChartOptions(): void {
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label(context: any) {
                            return context.dataset.label + ': ' + context.raw + ' dossiers';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre de dossiers'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mois'
                    }
                }
            }
        };
    }

    initChartData(): void {
        if (!this.stats || !this.stats.structures) { return; }

        const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const datasets: any[] = [];

        this.stats.structures.forEach((structure: any) => {
            const data = new Array(12).fill(0);
            if (structure.annees && structure.annees.length > 0) {
                const moisData = structure.annees[0].mois;
                moisData.forEach((m: any, index: number) => {
                    data[index] = m.totalDossiers;
                });
            }
            datasets.push({
                label: structure.structureNom,
                data,
                borderWidth: 2,
                tension: 0.4,
                fill: false
            });
        });

        this.chartData = {
            labels: mois,
            datasets
        };
    }

    // Redirection vers tous les dossiers d'une structure
    voirDossiersStructure(structure: any): void {
        if (!structure) {
            this.router.navigate(['/uab/dossiers']);
        } else {
            this.router.navigate(['/uab/dossiers'], {
                queryParams: {
                    structureId: structure.structureId,
                    structureNom: structure.structureNom
                }
            });
        }
    }

    // Redirection vers les dossiers d'une structure pour une année spécifique
    voirDossiersParAnnee(structure: any, annee: number): void {
        this.router.navigate(['/uab/dossiers'], {
            queryParams: {
                structureId: structure.structureId,
                structureNom: structure.structureNom,
                annee
            }
        });
    }

    // Redirection vers les dossiers d'une structure pour un mois spécifique
    voirDossiersParMois(structure: any, annee: number, mois: number): void {
        this.router.navigate(['/uab/dossiers'], {
            queryParams: {
                structureId: structure.structureId,
                structureNom: structure.structureNom,
                annee,
                mois
            }
        });
    }

    // Redirection vers tous les dossiers en attente
    voirDossiersEnAttente(): void {
        this.router.navigate(['/uab/dossiers'], {
            queryParams: { statut: 'COMPLET' }
        });
    }

    // Redirection vers tous les dossiers validés
    voirDossiersValides(): void {
        this.router.navigate(['/uab/dossiers'], {
            queryParams: { statut: 'VALIDEE_UAB' }
        });
    }

    // Redirection vers tous les dossiers rejetés
    voirDossiersRejetes(): void {
        this.router.navigate(['/uab/dossiers'], {
            queryParams: { statut: 'REJETEE' }
        });
    }

    getNomMois(mois: number): string {
        const moisNoms = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return moisNoms[mois - 1] || '';
    }

    getTotalParStructure(): number {
        if (!this.stats?.structures) { return 0; }
        return this.stats.structures.length;
    }

    getCouleurParType(type: string): string {
        switch (type) {
            case 'HOPITAL': return '#3b82f6';
            case 'CLINIQUE': return '#10b981';
            case 'PHARMACIE': return '#f59e0b';
            case 'LABORATOIRE': return '#8b5cf6';
            default: return '#6b7280';
        }
    }

    getIconeParType(type: string): string {
        switch (type) {
            case 'HOPITAL': return 'pi pi-building';
            case 'CLINIQUE': return 'pi pi-heart';
            case 'PHARMACIE': return 'pi pi-shopping-cart';
            case 'LABORATOIRE': return 'pi pi-flask';
            default: return 'pi pi-question';
        }
    }
}
