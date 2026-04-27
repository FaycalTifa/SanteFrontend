// pages/components/uab/dashboard/dashboard.component.ts - VERSION OPTIMISÉE
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { UabService } from '../../../services/uab/uab.service';
import { CacheService } from '../../../services/cache/cache.service';
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

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
export class DashboardComponent implements OnInit, OnDestroy {

    stats: any = null;
    loading = false;

    // Niveaux d'expansion
    expandedType: string | null = null;
    expandedYear: number | null = null;
    expandedMonth: number | null = null;

    structuredData: GroupData[] = [];

    chartData: any;
    chartOptions: any;

    dossiersDuMois: any[] = [];
    displayDossiersDialog = false;
    moisSelectionne: { annee: number, mois: number, nomMois: string, structure: StructureItem } | null = null;

    searchTerm = '';
    filteredStructuredData: GroupData[] = [];

    structureGroups = [
        { type: 'HOPITAL', label: '🏥 Hôpitaux', icon: 'pi pi-building', color: '#3b82f6', order: 1 },
        { type: 'CLINIQUE', label: '🏥 Cliniques', icon: 'pi pi-heart', color: '#10b981', order: 2 },
        { type: 'PHARMACIE', label: '💊 Pharmacies', icon: 'pi pi-shopping-cart', color: '#f59e0b', order: 3 },
        { type: 'LABORATOIRE', label: '🔬 Laboratoires', icon: 'pi pi-flask', color: '#8b5cf6', order: 4 },
        { type: 'AUTRE', label: '📋 Autres structures', icon: 'pi pi-building', color: '#6b7280', order: 5 }
    ];

    // ✅ Cache
    useCache = true;
    private destroy$ = new Subject<void>();

    constructor(
        private uabService: UabService,
        private cacheService: CacheService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadDashboard();
        this.initChartOptions();
    }



    // ✅ Version optimisée avec cache
    loadDashboard(): void {
        this.loading = true;

        // ✅ Vérifier le cache
        if (this.useCache) {
            const cachedStats = this.cacheService.get('dashboard_stats');
            if (cachedStats) {
                this.stats = cachedStats;
                this.loading = false;
                this.initChartData();
                this.restructureData();
                console.log('✅ Dashboard chargé depuis le cache');
                return;
            }
        }

        // Charger depuis l'API
        this.uabService.getDashboard()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    console.log('=== DONNÉES REÇUES DU BACKEND ===');
                    console.log('Stats générales:', {
                        totalDossiers: data.totalDossiers,
                        montantTotal: data.montantTotalPrisEnCharge
                    });
                    console.log('Structures:', data.structures?.map(s => ({
                        id: s.structureId,
                        nom: s.structureNom,
                        type: s.structureType,
                        totalDossiers: s.totalDossiers,
                        annees: s.annees?.map(a => ({
                            annee: a.annee,
                            totalDossiers: a.totalDossiers,
                            nbMois: a.mois?.filter(m => m.totalDossiers > 0).length
                        }))
                    })));

                    this.stats = data;
                    this.loading = false;
                    this.initChartData();
                    this.restructureData();

                    // ✅ Mettre en cache (5 minutes)
                    if (this.useCache) {
                        this.cacheService.set('dashboard_stats', data, 5 * 60 * 1000);
                    }
                },
                error: (error) => {
                    console.error('Erreur détaillée:', error);
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de charger le tableau de bord'
                    });
                }
            });
    }

    // ✅ Méthode pour forcer le rafraîchissement (appeler après validation/rejet)
    refreshDashboard(): void {
        this.cacheService.remove('dashboard_stats');
        this.loadDashboard();
    }

    restructureData(): void {
        if (!this.stats?.structures) { return; }

        const result: GroupData[] = [];

        for (const groupConfig of this.structureGroups) {
            // Filtrer les structures par type
            const structures = this.stats.structures.filter(
                (s: StructureStat) => s.structureType === groupConfig.type
            );

            if (structures.length === 0) { continue; }

            // Map pour regrouper par année
            const yearsMap = new Map<number, YearData>();

            structures.forEach((structure: StructureStat) => {
                if (structure.annees && structure.annees.length > 0) {
                    structure.annees.forEach((annee: AnneeStat) => {
                        // Initialiser l'année si nécessaire
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

                        // Traiter les mois
                        if (annee.mois && annee.mois.length > 0) {
                            annee.mois.forEach((mois: MoisStat) => {
                                // Ne montrer que les mois avec des dossiers
                                if (mois.totalDossiers > 0) {
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

                                    // Ajouter la structure avec ses données pour ce mois
                                    monthData.structures.push({
                                        id: structure.structureId,
                                        nom: structure.structureNom,
                                        totalDossiers: mois.totalDossiers,
                                        montantTotal: mois.montantTotal,
                                        type: this.getTypeLabel(structure.structureType)
                                    });
                                }
                            });
                        }
                    });
                }
            });

            // Trier les années (décroissant) et les mois (croissant)
            const years = Array.from(yearsMap.values()).map(year => ({
                ...year,
                mois: year.mois.sort((a: MonthData, b: MonthData) => a.mois - b.mois)
            })).sort((a, b) => b.annee - a.annee);

            // Ajouter le groupe seulement s'il a des données
            if (years.length > 0) {
                result.push({
                    type: groupConfig.type,
                    label: groupConfig.label,
                    icon: groupConfig.icon,
                    color: groupConfig.color,
                    order: groupConfig.order,
                    totalStructures: structures.length,
                    years
                });
            }
        }

        this.structuredData = result.sort((a, b) => a.order - b.order);
        this.filteredStructuredData = [...this.structuredData];
        console.log('Données restructurées:', JSON.stringify(this.structuredData, null, 2));
    }

    // Méthode utilitaire pour obtenir le libellé du type
    private getTypeLabel(type: string): string {
        const types: { [key: string]: string } = {
            HOPITAL: 'Hôpital',
            CLINIQUE: 'Clinique',
            PHARMACIE: 'Pharmacie',
            LABORATOIRE: 'Laboratoire'
        };
        return types[type] || type;
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

    // dashboard.component.ts - Modifier cette méthode

    voirDossiersStructure(structure: StructureItem, moisData?: MonthData, annee?: number): void {
        console.log('Navigation vers structure:', structure);
        console.log('Mois sélectionné:', moisData?.nomMois, annee);

        if (structure && structure.id) {
            // Construire les queryParams
            const queryParams: any = {
                structureId: structure.id,
                structureNom: structure.nom
            };

            // ✅ Ajouter le filtre du mois si disponible
            if (moisData && annee) {
                queryParams.mois = moisData.mois;
                queryParams.annee = annee;
                queryParams.nomMois = moisData.nomMois;
            }

            this.router.navigate(['/uab/dossiers'], { queryParams });
        }
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
        if (!this.stats?.structures) { return; }

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
        if (this.useCache && this.cacheService.get('dashboard_stats')) {
            // Si cache présent, utiliser la valeur calculée
            return this.stats?.totalDossiers || 0;
        }
        return this.stats?.totalDossiers || 0;
    }

    getEnAttente(): number {
        return 0;
    }

    getValides(): number {
        return this.stats?.totalDossiers || 0;
    }

    getRejetes(): number {
        return 0;
    }

    getMontantTotal(): number {
        if (this.useCache && this.cacheService.get('dashboard_stats')) {
            return this.stats?.montantTotalPrisEnCharge || 0;
        }
        return this.stats?.montantTotalPrisEnCharge || 0;
    }

    // ✅ Nettoyage des subscriptions
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
