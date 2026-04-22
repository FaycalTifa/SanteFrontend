// pages/components/uab/import-medicaments/import-medicaments.component.ts
import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MedicamentImportService } from '../../../services/MedicamentImport/medicament-import.service';

@Component({
    selector: 'app-import-medicaments',
    templateUrl: './import-medicaments.component.html',
    styleUrls: ['./import-medicaments.component.scss']
})
export class ImportMedicamentsComponent {

    // Pour les médicaments
    medicamentFile: File | null = null;
    medicamentUploading = false;

    // Pour les examens
    examenFile: File | null = null;
    examenUploading = false;

    constructor(
        private medicamentImportService: MedicamentImportService,
        private messageService: MessageService
    ) {}

    // ========== MÉTHODES POUR MÉDICAMENTS ==========

    onMedicamentFileSelected(event: any): void {
        let file: File | null = null;

        if (event.files && event.files.length > 0) {
            file = event.files[0];
        } else if (event.target && event.target.files && event.target.files.length > 0) {
            file = event.target.files[0];
        }

        if (file) {
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (extension === 'csv') {
                this.medicamentFile = file;
                this.messageService.add({
                    severity: 'info',
                    summary: 'Fichier sélectionné',
                    detail: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`
                });
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Veuillez sélectionner un fichier CSV (.csv) pour les médicaments'
                });
            }
        }
    }

    importerMedicaments(): void {
        if (!this.medicamentFile) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez sélectionner un fichier'
            });
            return;
        }

        this.medicamentUploading = true;
        this.medicamentImportService.importerMedicamentsCsv(this.medicamentFile).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: response.message || 'Import des médicaments réussi'
                });
                this.medicamentFile = null;
                this.medicamentUploading = false;

                const fileInput = document.getElementById('medicamentFileInput') as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }
            },
            error: (error) => {
                console.error('Erreur import médicaments:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.error || 'Erreur lors de l\'import des médicaments'
                });
                this.medicamentUploading = false;
            }
        });
    }

    clearMedicamentFile(): void {
        this.medicamentFile = null;
        const fileInput = document.getElementById('medicamentFileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    // ========== MÉTHODES POUR EXAMENS ==========

    onExamenFileSelected(event: any): void {
        let file: File | null = null;

        if (event.files && event.files.length > 0) {
            file = event.files[0];
        } else if (event.target && event.target.files && event.target.files.length > 0) {
            file = event.target.files[0];
        }

        if (file) {
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (extension === 'csv') {
                this.examenFile = file;
                this.messageService.add({
                    severity: 'info',
                    summary: 'Fichier sélectionné',
                    detail: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`
                });
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Veuillez sélectionner un fichier CSV (.csv) pour les examens'
                });
            }
        }
    }

    importerExamens(): void {
        if (!this.examenFile) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez sélectionner un fichier'
            });
            return;
        }

        this.examenUploading = true;
        this.medicamentImportService.importerExamensCsv(this.examenFile).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: response.message || 'Import des examens réussi'
                });
                this.examenFile = null;
                this.examenUploading = false;

                const fileInput = document.getElementById('examenFileInput') as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }
            },
            error: (error) => {
                console.error('Erreur import examens:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.error || 'Erreur lors de l\'import des examens'
                });
                this.examenUploading = false;
            }
        });
    }

    clearExamenFile(): void {
        this.examenFile = null;
        const fileInput = document.getElementById('examenFileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }
}
