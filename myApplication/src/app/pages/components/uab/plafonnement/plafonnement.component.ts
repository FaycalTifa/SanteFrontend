// pages/components/uab/plafonnement/plafonnement.component.ts
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import {Plafonnement} from '../../../models/Plafonnement';
import {PlafonnementService} from '../../../services/plafonnement/plafonnement.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OracleService} from '../../../services/oracle/oracle.service';

@Component({
    selector: 'app-plafonnement',
    templateUrl: './plafonnement.component.html',
    styleUrls: ['./plafonnement.component.scss']
})
export class PlafonnementComponent implements OnInit {

    searchForm: FormGroup;
    plafonnements: any[] = [];
    filteredPlafonnements: any[] = [];
    loading = false;
    rechercheEnCours = false;

    // Colonnes du tableau
    cols = [
        { field: 'CODEINTE', header: 'CODEINTE' },
        { field: 'NUMEPOLI', header: 'N° Police' },
        { field: 'CODECATE', header: 'Catégorie' },
        { field: 'CODEPRES', header: 'Code Prestation' },
        { field: 'LIBEPRES', header: 'Libellé Prestation' },
        { field: 'VALEPLAF', header: 'Montant Plafond' }
    ];

    // Filtres
    filterCodePres = '';
    filterLibelle = '';

    constructor(
        private fb: FormBuilder,
        private oracleService: OracleService,
        private messageService: MessageService
    ) {
        this.searchForm = this.fb.group({
            numPolice: ['', [Validators.required]],
            codeInte: ['', [Validators.required]]
        });
    }

    ngOnInit(): void {}

    rechercher(): void {
        const numPolice = this.searchForm.get('numPolice')?.value?.trim();
        const codeInte = this.searchForm.get('codeInte')?.value?.trim();

        if (!numPolice || !codeInte) {
            this.messageService.add({
                severity: 'warn',
                summary: '⚠️ Attention',
                detail: 'Veuillez saisir le N° Police et le CODEINTE'
            });
            return;
        }

        this.loading = true;
        this.rechercheEnCours = true;

        this.oracleService.getPlafonnementsAll(numPolice, codeInte).subscribe({
            next: (data) => {
                console.log('=== PLAFONNEMENTS REÇUS ===', data);
                this.plafonnements = data;
                this.filteredPlafonnements = data;
                this.loading = false;
                this.rechercheEnCours = false;

                if (data.length === 0) {
                    this.messageService.add({
                        severity: 'info',
                        summary: '📋 Aucun résultat',
                        detail: 'Aucun plafonnement trouvé pour cette police.'
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: '✅ Résultats',
                        detail: `${data.length} plafonnement(s) trouvé(s)`
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
                    detail: error.error?.message || 'Erreur lors de la recherche des plafonnements.'
                });
            }
        });
    }

    resetSearch(): void {
        this.searchForm.reset();
        this.plafonnements = [];
        this.filteredPlafonnements = [];
        this.filterCodePres = '';
        this.filterLibelle = '';

        this.messageService.add({
            severity: 'info',
            summary: '🔄 Réinitialisé',
            detail: 'Les filtres ont été réinitialisés.'
        });
    }

    appliquerFiltres(): void {
        let result = [...this.plafonnements];

        if (this.filterCodePres) {
            result = result.filter(p =>
                p.CODEPRES?.toLowerCase().includes(this.filterCodePres.toLowerCase())
            );
        }

        if (this.filterLibelle) {
            result = result.filter(p =>
                p.LIBEPRES?.toLowerCase().includes(this.filterLibelle.toLowerCase())
            );
        }

        this.filteredPlafonnements = result;
    }

    resetFiltres(): void {
        this.filterCodePres = '';
        this.filterLibelle = '';
        this.filteredPlafonnements = [...this.plafonnements];
    }

    getCategorieLabel(codeCate: number): string {
        const categories: { [key: number]: string } = {
            100: 'Consultations générales',
            101: 'Consultations spécialisées',
            102: 'Actes techniques',
            103: 'Hospitalisation',
            104: 'Urgences'
        };
        return categories[codeCate] || `Catégorie ${codeCate}`;
    }

    getCategorieClass(codeCate: number): string {
        const classes: { [key: number]: string } = {
            100: 'cate-100',
            101: 'cate-101',
            102: 'cate-102',
            103: 'cate-103',
            104: 'cate-104'
        };
        return classes[codeCate] || 'cate-default';
    }

    getTotalPlafond(): number {
        return this.filteredPlafonnements.reduce((sum, p) => sum + (p.VALEPLAF || 0), 0);
    }
}
