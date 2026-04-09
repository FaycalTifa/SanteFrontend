import { Component, OnInit } from '@angular/core';
import { ConsultationService } from '../../../services/consultation/consultation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';
import { StructureService } from '../../../services/structure/structure.service';

@Component({
    selector: 'app-dossiers',
    templateUrl: './dossiers.component.html',
    styleUrls: ['./dossiers.component.scss']
})
export class DossiersComponent implements OnInit {

    dossiers: any[] = [];
    filteredDossiers: any[] = [];
    loading = false;

    // Filtres
    searchPolice = '';
    selectedStatut = '';
    selectedStructureId: number | null = null;
    selectedStructureNom = '';
    selectedTypeDossier = '';
    dateDebut: Date | null = null;
    dateFin: Date | null = null;
    selectedAnnee: number | null = null;
    selectedMois: number | null = null;

    selectedDossier: any = null;
    displayValidationDialog = false;

    structures: any[] = [];

    typeDossiers = [
        { label: '📋 Tous', value: '' },
        { label: '🏥 Consultation', value: 'CONSULTATION' },
        { label: '💊 Prescription Médicament', value: 'PRESCRIPTION_MEDICAMENT' },
        { label: '🔬 Prescription Examen', value: 'PRESCRIPTION_EXAMEN' }
    ];

    statuts = [
        { label: '📋 Tous', value: '' },
        { label: '⏳ En attente de validation UAB', value: 'COMPLET' },
        { label: '✅ Validés UAB', value: 'VALIDEE_UAB' },
        { label: '❌ Rejetés', value: 'REJETEE' },
        { label: '💊 En attente délivrance', value: 'EN_ATTENTE_DELIVRANCE' },
        { label: '✅ Délivré', value: 'DELIVRE' },
        { label: '🔬 En attente paiement', value: 'EN_ATTENTE_PAIEMENT' },
        { label: '💰 Payé', value: 'PAYE' },
        { label: '✅ Réalisé', value: 'REALISE' }
    ];

    constructor(
        private consultationService: ConsultationService,
        private structureService: StructureService,
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadStructures();
        this.route.queryParams.subscribe(params => {
            this.selectedStatut = params.statut || '';
            this.searchPolice = params.police || '';

            // ✅ Récupérer l'ID de la structure (prioritaire)
            this.selectedStructureId = params.structureId ? +params.structureId : null;
            this.selectedStructureNom = params.structureNom || '';

            // ✅ Si on a un ID, on récupère le nom correspondant
            if (this.selectedStructureId && !this.selectedStructureNom) {
                const structure = this.structures.find(s => s.id === this.selectedStructureId);
                if (structure) {
                    this.selectedStructureNom = structure.nom;
                }
            }

            this.selectedTypeDossier = params.type || '';
            this.selectedAnnee = params.annee ? +params.annee : null;
            this.selectedMois = params.mois ? +params.mois : null;

            console.log('Filtres reçus:', {
                structureId: this.selectedStructureId,
                structureNom: this.selectedStructureNom,
                type: this.selectedTypeDossier,
                annee: this.selectedAnnee,
                mois: this.selectedMois
            });

            this.loadDossiers();
        });
    }



    loadStructures(): void {
        this.structureService.getAllStructures().subscribe({
            next: (data) => {
                this.structures = data;
            },
            error: (error) => {
                console.error('Erreur chargement structures:', error);
            }
        });
    }

    // ✅ Ajoutez une méthode pour charger les dossiers avec debug
    loadDossiers(): void {
        this.loading = true;
        this.consultationService.getAllDossiersUAB(this.selectedStatut || undefined, this.searchPolice || undefined).subscribe({
            next: (data) => {
                console.log('=== TOUS LES DOSSIERS UAB ===');
                console.log('Nombre total:', data.length);

                // Afficher les structures disponibles pour debug
                const structuresUniques = [...new Set(data.map(d => d.structureNom))];
                console.log('Structures disponibles dans les dossiers:', structuresUniques);

                this.dossiers = data.map(d => ({
                    ...d,
                    structureType: this.getStructureTypeFromNom(d.structureNom)
                }));

                console.log('Filtre structure demandé:', this.selectedStructureNom);
                console.log('Structures disponibles:', structuresUniques);

                this.applyFilters();
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                console.error('Erreur chargement:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les dossiers'
                });
            }
        });
    }

    getStructureTypeFromNom(nom: string): string {
        if (!nom) { return 'Inconnu'; }
        const nomLower = nom.toLowerCase();
        if (nomLower.includes('clinique') || nomLower.includes('hôpital') || nomLower.includes('centre médical')) {
            return 'Hôpital';
        }
        if (nomLower.includes('pharmacie')) {
            return 'Pharmacie';
        }
        if (nomLower.includes('laboratoire') || nomLower.includes('labo')) {
            return 'Laboratoire';
        }
        return 'Autre';
    }

    applyFilters(): void {
        let result = [...this.dossiers];

        console.log('=== APPLICATION DES FILTRES ===');
        console.log('Dossiers avant filtrage:', result.length);
        console.log('Filtre structureNom:', this.selectedStructureNom);
        console.log('Filtre structureId:', this.selectedStructureId);

        console.log('=== APPLICATION DES FILTRES ===');
        console.log('Filtre structureId:', this.selectedStructureId);
        console.log('Filtre structureNom:', this.selectedStructureNom);

        // ✅ Filtre par ID de structure (le plus précis)
        if (this.selectedStructureId) {
            result = result.filter(d => d.structureId === this.selectedStructureId);
            console.log('Après filtre structureId:', result.length);
        }
        // ✅ Fallback: filtre par nom de structure
        else if (this.selectedStructureNom) {
            result = result.filter(d => d.structureNom === this.selectedStructureNom);
            console.log('Après filtre structureNom:', result.length);
        }

        // ✅ Afficher les structures trouvées pour debug
        const structuresTrouvees = [...new Set(result.map(d => d.structureNom))];
        console.log('Structures dans les résultats:', structuresTrouvees);

        // ✅ Filtre par type de dossier
        if (this.selectedTypeDossier) {
            result = result.filter(d => d.type === this.selectedTypeDossier);
            console.log('Après filtre type:', result.length);
        }

        // ✅ Filtre par structure (basé sur le nom de la structure émettrice)
        if (this.selectedStructureNom) {
            result = result.filter(d => d.structureNom === this.selectedStructureNom);
            console.log('Après filtre structureNom:', result.length);
            console.log('Structures trouvées:', result.map(d => d.structureNom));
        } else if (this.selectedStructureId) {
            const structure = this.structures.find(s => s.id === this.selectedStructureId);
            if (structure) {
                result = result.filter(d => d.structureNom === structure.nom);
                console.log('Après filtre structureId:', result.length);
            }
        }

        // ✅ Filtre par année
        if (this.selectedAnnee) {
            result = result.filter(d => {
                const date = new Date(d.dateConsultation || d.dateCreation);
                return date.getFullYear() === this.selectedAnnee;
            });
            console.log('Après filtre année:', result.length);
        }

        // ✅ Filtre par mois
        if (this.selectedMois) {
            result = result.filter(d => {
                const date = new Date(d.dateConsultation || d.dateCreation);
                return date.getMonth() + 1 === this.selectedMois;
            });
            console.log('Après filtre mois:', result.length);
        }

        // ✅ Filtre par recherche police
        if (this.searchPolice) {
            result = result.filter(d =>
                d.numeroPolice?.toLowerCase().includes(this.searchPolice.toLowerCase())
            );
            console.log('Après filtre police:', result.length);
        }

        // ✅ Filtre par statut
        if (this.selectedStatut) {
            result = result.filter(d => {
                if (this.selectedStatut === 'COMPLET') {
                    return !d.validationUab && d.statut !== 'REJETEE' && d.statut !== 'DELIVRE' && d.statut !== 'REALISE';
                }
                if (this.selectedStatut === 'VALIDEE_UAB') {
                    return d.validationUab === true;
                }
                if (this.selectedStatut === 'REJETEE') {
                    return d.statut === 'REJETEE';
                }
                return d.statut === this.selectedStatut;
            });
            console.log('Après filtre statut:', result.length);
        }

        // ✅ Filtre par date
        if (this.dateDebut) {
            result = result.filter(d => new Date(d.dateConsultation || d.dateCreation) >= this.dateDebut!);
        }
        if (this.dateFin) {
            const fin = new Date(this.dateFin);
            fin.setHours(23, 59, 59);
            result = result.filter(d => new Date(d.dateConsultation || d.dateCreation) <= fin);
        }

        this.filteredDossiers = result;
        console.log(`Total après tous filtres: ${this.filteredDossiers.length} dossiers`);
    }


    search(): void {
        this.applyFilters();
    }

    reset(): void {
        this.searchPolice = '';
        this.selectedStatut = '';
        this.selectedStructureId = null;
        this.selectedStructureNom = '';
        this.selectedTypeDossier = '';
        this.dateDebut = null;
        this.dateFin = null;
        this.selectedAnnee = null;
        this.selectedMois = null;

        // Rediriger vers la même page sans paramètres
        this.router.navigate(['/uab/dossiers']);
        this.loadDossiers();
    }

    hasActiveFilters(): boolean {
        return !!(this.searchPolice ||
            this.selectedStructureId ||
            this.selectedStructureNom ||
            this.selectedStatut ||
            this.selectedTypeDossier ||
            this.dateDebut ||
            this.dateFin ||
            this.selectedAnnee ||
            this.selectedMois);
    }

    getFiltresActifsMessage(): string {
        const filtres = [];
        if (this.selectedStructureNom) { filtres.push(`Structure: ${this.selectedStructureNom}`); }
        if (this.selectedAnnee) { filtres.push(`Année: ${this.selectedAnnee}`); }
        if (this.selectedMois) { filtres.push(`Mois: ${this.getNomMois(this.selectedMois)}`); }
        if (this.selectedStatut === 'COMPLET') { filtres.push('Statut: En attente de validation'); }
        if (this.selectedStatut === 'VALIDEE_UAB') { filtres.push('Statut: Validés UAB'); }
        if (this.selectedStatut === 'REJETEE') { filtres.push('Statut: Rejetés'); }
        if (this.selectedTypeDossier) { filtres.push(`Type: ${this.getTypeLabel(this.selectedTypeDossier)}`); }
        if (this.searchPolice) { filtres.push(`Police: ${this.searchPolice}`); }
        if (this.dateDebut || this.dateFin) {
            const debut = this.dateDebut ? this.dateDebut.toLocaleDateString() : 'début';
            const fin = this.dateFin ? this.dateFin.toLocaleDateString() : 'fin';
            filtres.push(`Période: ${debut} - ${fin}`);
        }

        return filtres.length > 0 ? filtres.join(' • ') : 'Tous les dossiers';
    }

    getNomMois(mois: number | null): string {
        if (!mois) { return ''; }
        const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return moisNoms[mois - 1];
    }

    getTypeLabel(type: string): string {
        const typeObj = this.typeDossiers.find(t => t.value === type);
        return typeObj ? typeObj.label : 'Consultation';
    }

    getTypeIconByValue(type: string): string {
        switch (type) {
            case 'CONSULTATION': return 'pi pi-file';
            case 'PRESCRIPTION_MEDICAMENT': return 'pi pi-tablets';
            case 'PRESCRIPTION_EXAMEN': return 'pi pi-microscope';
            default: return 'pi pi-folder-open';
        }
    }



    getStatutCount(statut: string): number {
        return this.filteredDossiers.filter(d => {
            if (statut === 'COMPLET') { return !d.validationUab && d.statut !== 'REJETEE' && d.statut !== 'DELIVRE' && d.statut !== 'REALISE'; }
            if (statut === 'VALIDEE_UAB') { return d.validationUab === true; }
            if (statut === 'REJETEE') { return d.statut === 'REJETEE'; }
            return false;
        }).length;
    }

    getTypeClass(dossier: any): string {
        const type = dossier.type || 'CONSULTATION';
        switch (type) {
            case 'CONSULTATION': return 'type-consultation';
            case 'PRESCRIPTION_MEDICAMENT': return 'type-medicament';
            case 'PRESCRIPTION_EXAMEN': return 'type-examen';
            default: return 'type-default';
        }
    }

    getTypeIcon(dossier: any): string {
        const type = dossier.type || 'CONSULTATION';
        switch (type) {
            case 'CONSULTATION': return 'pi pi-file';
            case 'PRESCRIPTION_MEDICAMENT': return 'pi pi-tablets';
            case 'PRESCRIPTION_EXAMEN': return 'pi pi-microscope';
            default: return 'pi pi-file';
        }
    }

    getStatusClass(dossier: any): string {
        if (dossier.validationUab === true) { return 'status-success'; }
        if (dossier.statut === 'REJETEE' || dossier.validationUab === false) { return 'status-danger'; }
        if (dossier.statut === 'DELIVRE' || dossier.statut === 'REALISE') { return 'status-success'; }
        if (dossier.statut === 'PAYE') { return 'status-warning'; }
        return 'status-warning';
    }

    getStatusIcon(dossier: any): string {
        if (dossier.validationUab === true) { return 'pi pi-check-circle'; }
        if (dossier.statut === 'REJETEE' || dossier.validationUab === false) { return 'pi pi-times-circle'; }
        if (dossier.statut === 'DELIVRE' || dossier.statut === 'REALISE') { return 'pi pi-check-circle'; }
        if (dossier.statut === 'PAYE') { return 'pi pi-credit-card'; }
        return 'pi pi-clock';
    }

    getStatusLabel(dossier: any): string {
        if (dossier.validationUab === true) { return 'Validé UAB'; }
        if (dossier.statut === 'REJETEE' || dossier.validationUab === false) { return 'Rejeté'; }
        if (dossier.statut === 'DELIVRE') { return 'Délivré'; }
        if (dossier.statut === 'REALISE') { return 'Réalisé'; }
        if (dossier.statut === 'PAYE') { return 'Payé'; }
        if (dossier.statut === 'EN_ATTENTE_DELIVRANCE') { return 'Attente délivrance'; }
        if (dossier.statut === 'EN_ATTENTE_PAIEMENT') { return 'Attente paiement'; }
        return 'En attente validation';
    }

    canValidate(dossier: any): boolean {
        return dossier.type === 'CONSULTATION' &&
            !dossier.validationUab &&
            dossier.statut !== 'REJETEE';
    }

    validerRapidement(dossier: any): void {
        if (dossier.validationUab === true) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Ce dossier a déjà été validé'
            });
            return;
        }
        if (dossier.statut === 'REJETEE') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Ce dossier a été rejeté et ne peut pas être validé'
            });
            return;
        }
        if (dossier.type !== 'CONSULTATION') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Seules les consultations peuvent être validées par UAB'
            });
            return;
        }
        this.selectedDossier = dossier;
        this.displayValidationDialog = true;
    }

    confirmerValidation(): void {
        if (!this.selectedDossier) { return; }

        this.loading = true;
        this.consultationService.valider(this.selectedDossier.id).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Dossier validé avec succès'
                });
                this.displayValidationDialog = false;
                this.loadDossiers();
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                console.error('Erreur validation:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de la validation'
                });
            }
        });
    }

    // dossiers.component.ts - Ajoutez cette méthode

    exportToExcel(): void {
        if (!this.filteredDossiers || this.filteredDossiers.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune donnée à exporter'
            });
            return;
        }

        try {
            // Préparer les données pour l'export
            const exportData = this.filteredDossiers.map((dossier, index) => ({
                '#': index + 1,
                'N° Document': dossier.numeroFeuille || dossier.numero || '',
                Date: this.formatDate(dossier.dateConsultation || dossier.dateCreation),
                Patient: `${dossier.prenomPatient || ''} ${dossier.nomPatient || ''}`.trim(),
                'N° Police': dossier.numeroPolice || '',
                'Structure émettrice': dossier.structureNom || '',
                Type: this.getTypeLabel(dossier.type || 'CONSULTATION'),
                'Montant total (FCFA)': dossier.montantTotalHospitalier || dossier.montantTotal || 0,
                'Pris en charge (FCFA)': dossier.montantPrisEnCharge || 0,
                'Ticket modérateur (FCFA)': dossier.montantTicketModerateur || 0,
                Statut: this.getStatusLabel(dossier),
                Origine: dossier.origine || ''
            }));

            // Convertir en CSV
            const csvContent = this.convertToCSV(exportData);

            // Télécharger le fichier
            this.downloadCSV(csvContent, `dossiers_uab_${this.getCurrentDate()}.csv`);

            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `${this.filteredDossiers.length} dossiers exportés avec succès`
            });
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de l\'export des données'
            });
        }
    }

// Méthode pour exporter en Excel (XLSX)
    exportToExcelXLSX(): void {
        if (!this.filteredDossiers || this.filteredDossiers.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune donnée à exporter'
            });
            return;
        }

        try {
            // Préparer les données
            const exportData = this.filteredDossiers.map((dossier, index) => ({
                Numéro: index + 1,
                Document: dossier.numeroFeuille || dossier.numero || '',
                Date: this.formatDate(dossier.dateConsultation || dossier.dateCreation),
                Patient: `${dossier.prenomPatient || ''} ${dossier.nomPatient || ''}`.trim(),
                Police: dossier.numeroPolice || '',
                Structure: dossier.structureNom || '',
                Type: this.getTypeLabel(dossier.type || 'CONSULTATION'),
                'Montant Total': dossier.montantTotalHospitalier || dossier.montantTotal || 0,
                'Pris en Charge': dossier.montantPrisEnCharge || 0,
                'Ticket Modérateur': dossier.montantTicketModerateur || 0,
                Statut: this.getStatusLabel(dossier),
                Origine: dossier.origine || ''
            }));

            // Créer une feuille de calcul
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Ajuster la largeur des colonnes
            const colWidths = [
                {wch: 8}, {wch: 15}, {wch: 12}, {wch: 25}, {wch: 15},
                {wch: 25}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 18}, {wch: 20}, {wch: 12}
            ];
            worksheet['!cols'] = colWidths;

            // Créer le classeur
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Dossiers UAB');

            // Générer le fichier
            XLSX.writeFile(workbook, `dossiers_uab_${this.getCurrentDate()}.xlsx`);

            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `${this.filteredDossiers.length} dossiers exportés avec succès`
            });
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de l\'export des données'
            });
        }
    }

// Méthode utilitaire pour convertir en CSV
    private convertToCSV(data: any[]): string {
        if (!data || data.length === 0) { return ''; }

        const headers = Object.keys(data[0]);
        const csvRows = [];

        // Ajouter les en-têtes
        csvRows.push(headers.join(','));

        // Ajouter les lignes
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header]?.toString() || '';
                // Échapper les guillemets et les virgules
                return `"${value.replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

// Méthode utilitaire pour télécharger le fichier CSV
    private downloadCSV(csvContent: string, filename: string): void {
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

// Méthode utilitaire pour formater la date
    private formatDate(dateString: string): string {
        if (!dateString) { return ''; }
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR');
        } catch {
            return dateString;
        }
    }

// Méthode utilitaire pour obtenir la date courante
    private getCurrentDate(): string {
        const now = new Date();
        return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    }
}
