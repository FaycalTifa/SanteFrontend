import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { UabService } from '../../../services/uab/uab.service';

@Component({
    selector: 'app-dossiers-payes',
    templateUrl: './dossiers-payes.component.html',
    styleUrls: ['./dossiers-payes.component.scss']
})
export class DossiersPayesComponent implements OnInit {

    dossiers: any[] = [];
    loading = false;

    constructor(
        private uabService: UabService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadDossiersPayes();
    }

    loadDossiersPayes(): void {
        this.loading = true;
        this.uabService.getDossiersPayes().subscribe({
            next: (data) => {
                this.dossiers = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Erreur chargement dossiers payés:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les dossiers payés'
                });
                this.loading = false;
            }
        });
    }

    getTypeLabel(type: string): string {
        const types: { [key: string]: string } = {
            CONSULTATION: 'Consultation',
            PRESCRIPTION_MEDICAMENT: 'Médicament',
            PRESCRIPTION_EXAMEN: 'Examen'
        };
        return types[type] || type;
    }

    refresh(): void {
        this.loadDossiersPayes();
    }

    getTypeIcon(type: string): string {
        const icons: { [key: string]: string } = {
            CONSULTATION: 'pi pi-folder-open',
            PRESCRIPTION_MEDICAMENT: 'pi pi-tablets',
            PRESCRIPTION_EXAMEN: 'pi pi-microscope'
        };
        return icons[type] || 'pi pi-file';
    }
}
