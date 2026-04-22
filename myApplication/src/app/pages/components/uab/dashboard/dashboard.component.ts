// pages/components/uab/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { UabService } from '../../../services/uab/uab.service';

// ✅ Interfaces pour le typage
interface StructureStat {
    structureId: number;
    structureNom: string;
    structureType: string;
    totalDossiers: number;
    montantTotal: number;
    annees: AnneeStat[];
}

interface AnneeStat {
    annee: number;
    totalDossiers: number;
    montantTotal: number;
    mois: MoisStat[];
}

interface MoisStat {
    mois: number;
    nomMois: string;
    totalDossiers: number;
    montantTotal: number;
}

interface MonthData {
    mois: number;
    nomMois: string;
    totalDossiers: number;
    montantTotal: number;
    structures: StructureItem[];
}

interface YearData {
    annee: number;
    totalDossiers: number;
    montantTotal: number;
    mois: MonthData[];
}

interface GroupData {
    type: string;
    label: string;
    icon: string;
    color: string;
    order: number;
    totalStructures: number;
    years: YearData[];
}

interface StructureItem {
    id: number;
    nom: string;
    totalDossiers: number;
    montantTotal: number;
    type: string;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    stats: any = null;
    loading = false;

    // Niveaux d'expansion
    expandedType: string | null = null;
    expandedYear: number | null = null;
    expandedMonth: number | null = null;

    structuredData: GroupData[] = [];

    chartData: any;
    chartOptions: any;

    searchTerm = '';
    filteredStructuredData: GroupData[] = [];

    structureGroups = [
        { type: 'HOPITAL', label: '🏥 Hôpitaux', icon: 'pi pi-building', color: '#3b82f6', order: 1 },
        { type: 'CLINIQUE', label: '🏥 Cliniques', icon: 'pi pi-heart', color: '#10b981', order: 2 },
        { type: 'PHARMACIE', label: '💊 Pharmacies', icon: 'pi pi-shopping-cart', color: '#f59e0b', order: 3 },
        { type: 'LABORATOIRE', label: '🔬 Laboratoires', icon: 'pi pi-flask', color: '#8b5cf6', order: 4 },
        { type: 'AUTRE', label: '📋 Autres structures', icon: 'pi pi-building', color: '#6b7280', order: 5 }
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
                this.restructureData();
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

    restructureData(): void {
        if (!this.stats?.structures) return;

        const result: GroupData[] = [];

        for (const groupConfig of this.structureGroups) {
            const structures = this.stats.structures.filter(
                (s: StructureStat) => s.structureType === groupConfig.type
            );

            if (structures.length === 0) continue;

            const yearsMap = new Map<number, YearData>();

            structures.forEach((structure: StructureStat) => {
                if (structure.annees && structure.annees.length > 0) {
                    structure.annees.forEach((annee: AnneeStat) => {
                        if (!yearsMap.has(annee.annee)) {
                            yearsMap.set(annee.annee, {
                                annee: annee.annee,
                                totalDossiers: 0,
                                montantTotal: 0,
                                mois: []
                            });
                        }
                        const yearData = yearsMap.get(annee.annee)!;
                        yearData.totalDossiers += annee.totalDossiers;
                        yearData.montantTotal += annee.montantTotal;

                        if (annee.mois && annee.mois.length > 0) {
                            annee.mois.forEach((mois: MoisStat) => {
                                let monthData = yearData.mois.find(m => m.mois === mois.mois);
                                if (!monthData) {
                                    monthData = {
                                        mois: mois.mois,
                                        nomMois: this.getNomMois(mois.mois),
                                        totalDossiers: 0,
                                        montantTotal: 0,
                                        structures: []
                                    };
                                    yearData.mois.push(monthData);
                                }
                                monthData.totalDossiers += mois.totalDossiers;
                                monthData.montantTotal += mois.montantTotal;

                                if (mois.totalDossiers > 0) {
                                    monthData.structures.push({
                                        id: structure.structureId,
                                        nom: structure.structureNom,
                                        totalDossiers: mois.totalDossiers,
                                        montantTotal: mois.montantTotal,
                                        type: structure.structureType
                                    });
                                }
                            });
                        }
                    });
                }
            });

            // ✅ CORRECTION ICI : trier correctement les mois
            const years = Array.from(yearsMap.values()).map(year => ({
                ...year,
                mois: year.mois.sort((a: MonthData, b: MonthData) => a.mois - b.mois)
            })).sort((a, b) => b.annee - a.annee);

            result.push({
                type: groupConfig.type,
                label: groupConfig.label,
                icon: groupConfig.icon,
                color: groupConfig.color,
                order: groupConfig.order,
                totalStructures: structures.length,
                years: years
            });
        }

        this.structuredData = result.sort((a, b) => a.order - b.order);
        this.filteredStructuredData = [...this.structuredData];
        console.log('Données restructurées:', this.structuredData);
    }

    filterData(): void {
        if (!this.searchTerm.trim()) {
            this.filteredStructuredData = [...this.structuredData];
            return;
        }

        const searchLower = this.searchTerm.toLowerCase().trim();

        this.filteredStructuredData = this.structuredData
            .map(group => {
                const filteredYears = group.years
                    .map(year => ({
                        ...year,
                        mois: year.mois
                            .map(month => ({
                                ...month,
                                structures: month.structures.filter(s =>
                                    s.nom?.toLowerCase().includes(searchLower)
                                )
                            }))
                            .filter(month => month.structures.length > 0)
                    }))
                    .filter(year => year.mois.length > 0);

                return { ...group, years: filteredYears };
            })
            .filter(group => group.years.length > 0);
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.filteredStructuredData = [...this.structuredData];
    }

    getTotalStructures(): number {
        return this.filteredStructuredData.reduce(
            (total, group) => total + group.totalStructures, 0
        );
    }

    getTypeTotalDossiers(group: GroupData): number {
        return group.years.reduce((sum, year) => sum + year.totalDossiers, 0);
    }

    getTypeMontantTotal(group: GroupData): number {
        return group.years.reduce((sum, year) => sum + year.montantTotal, 0);
    }

    toggleType(type: string): void {
        this.expandedType = this.expandedType === type ? null : type;
        this.expandedYear = null;
        this.expandedMonth = null;
    }

    toggleYear(year: number): void {
        this.expandedYear = this.expandedYear === year ? null : year;
        this.expandedMonth = null;
    }

    toggleMonth(month: number): void {
        this.expandedMonth = this.expandedMonth === month ? null : month;
    }

    voirDossiersStructure(structure: StructureItem): void {
        this.router.navigate(['/uab/dossiers'], {
            queryParams: {
                structureId: structure.id,
                structureNom: structure.nom
            }
        });
    }

    voirDossiersEnAttente(): void {
        this.router.navigate(['/uab/dossiers'], { queryParams: { statut: 'COMPLET' } });
    }

    voirDossiersValides(): void {
        this.router.navigate(['/uab/dossiers'], { queryParams: { statut: 'VALIDEE_UAB' } });
    }

    voirDossiersRejetes(): void {
        this.router.navigate(['/uab/dossiers'], { queryParams: { statut: 'REJETEE' } });
    }

    // ========== MÉTHODES UTILITAIRES ==========

    initChartOptions(): void {
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Nombre de dossiers' } },
                x: { title: { display: true, text: 'Mois' } }
            }
        };
    }

    initChartData(): void {
        if (!this.stats?.structures) return;

        const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const datasets: any[] = [];

        this.stats.structures.forEach((structure: StructureStat) => {
            const data = new Array(12).fill(0);
            if (structure.annees && structure.annees.length > 0) {
                const moisData = structure.annees[0]?.mois || [];
                moisData.forEach((m: MoisStat, index: number) => {
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

        this.chartData = { labels: mois, datasets };
    }

    getNomMois(mois: number): string {
        const moisNoms = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return moisNoms[mois - 1] || '';
    }

    getTotalDossiers(): number {
        return this.stats?.totalDossiers || 0;
    }

    getEnAttente(): number {
        return this.stats?.enAttente || 0;
    }

    getValides(): number {
        return this.stats?.valides || 0;
    }

    getRejetes(): number {
        return this.stats?.rejetes || 0;
    }

    getMontantTotal(): number {
        return this.stats?.montantTotalPrisEnCharge || 0;
    }
}
