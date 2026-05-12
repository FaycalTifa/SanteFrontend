import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { UabService } from '../../../services/uab/uab.service';
import { CacheService } from '../../../services/cache/cache.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {DashboardRefreshService} from "../../../services/DashboardRefresh/dashboard-refresh.service";

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
    selector: 'app-dashboard-payes',
    templateUrl: './dashboard-payes.component.html',
    styleUrls: ['./dashboard-payes.component.scss']
})
export class DashboardPayesComponent implements OnInit, OnDestroy {

    stats: any = null;
    loading = false;

    expandedType: string | null = null;
    expandedYear: number | null = null;
    expandedMonth: number | null = null;

    structuredData: GroupData[] = [];
    searchTerm = '';
    filteredStructuredData: GroupData[] = [];

    private destroy$ = new Subject<void>();

    structureGroups = [
        { type: 'HOPITAL', label: '🏥 Hôpitaux', icon: 'pi pi-building', color: '#3b82f6', order: 1 },
        { type: 'CLINIQUE', label: '🏥 Cliniques', icon: 'pi pi-heart', color: '#10b981', order: 2 },
        { type: 'PHARMACIE', label: '💊 Pharmacies', icon: 'pi pi-shopping-cart', color: '#f59e0b', order: 3 },
        { type: 'LABORATOIRE', label: '🔬 Laboratoires', icon: 'pi pi-flask', color: '#8b5cf6', order: 4 },
        { type: 'AUTRE', label: '📋 Autres structures', icon: 'pi pi-building', color: '#6b7280', order: 5 }
    ];

    constructor(
        private uabService: UabService,
        private cacheService: CacheService,
        private router: Router,
        private dashboardRefreshService: DashboardRefreshService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadDashboard();
    }


    loadDashboard(): void {
        this.loading = true;
        this.uabService.getDashboardPayes()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.stats = data;
                    this.loading = false;
                    this.restructureData();
                },
                error: (error) => {
                    console.error('Erreur chargement dashboard payés:', error);
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de charger le tableau de bord des paiements'
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

            const years = Array.from(yearsMap.values()).map(year => ({
                ...year,
                mois: year.mois.sort((a, b) => a.mois - b.mois)
            })).sort((a, b) => b.annee - a.annee);

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

    voirDossiersStructure(structure: StructureItem, moisData?: MonthData, annee?: number): void {
        if (structure && structure.id) {
            const queryParams: any = {
                structureId: structure.id,
                structureNom: structure.nom,
                payeParUab: true  // Permet de filtrer seulement les dossiers payés
            };
            if (moisData && annee) {
                queryParams.mois = moisData.mois;
                queryParams.annee = annee;
                queryParams.nomMois = moisData.nomMois;
            }
            this.router.navigate(['/uab/dossiers'], { queryParams });
        }
    }

    getNomMois(mois: number): string {
        const moisNoms = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return moisNoms[mois - 1] || '';
    }

    getTypeLabel(type: string): string {
        const types: { [key: string]: string } = {
            HOPITAL: 'Hôpital',
            CLINIQUE: 'Clinique',
            PHARMACIE: 'Pharmacie',
            LABORATOIRE: 'Laboratoire'
        };
        return types[type] || type;
    }

    getTotalDossiers(): number {
        return this.stats?.totalDossiers || 0;
    }

    getMontantTotal(): number {
        return this.stats?.montantTotalPrisEnCharge || 0;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
