import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AdminValidationService } from '../../../services/adminValidation/admin-validation.service';

@Component({
    selector: 'app-admin-validations',
    templateUrl: './admin-validations.component.html',
    styleUrls: ['./admin-validations.component.scss']
})
export class AdminValidationsComponent implements OnInit {
    medicaments: any[] = [];
    examens: any[] = [];
    loadingMedocs = false;
    loadingExamens = false;

    constructor(
        private adminService: AdminValidationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadMedicaments();
        this.loadExamens();
    }

    loadMedicaments(): void {
        this.loadingMedocs = true;
        this.adminService.getMedicamentsEnAttente().subscribe({
            next: (data) => {
                this.medicaments = data;
                this.loadingMedocs = false;
            },
            error: (err) => {
                console.error('Erreur chargement médicaments:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les médicaments en attente'
                });
                this.loadingMedocs = false;
            }
        });
    }

    loadExamens(): void {
        this.loadingExamens = true;
        this.adminService.getExamensEnAttente().subscribe({
            next: (data) => {
                this.examens = data;
                this.loadingExamens = false;
            },
            error: (err) => {
                console.error('Erreur chargement examens:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les examens en attente'
                });
                this.loadingExamens = false;
            }
        });
    }

    /**
     * Valider un médicament
     * @param id ID du médicament
     * @param exclusion true = exclu (OUI), false = autorisé (NON)
     */
    validerMedicament(id: number, exclusion: string): void {
        this.adminService.validerMedicament(id, exclusion).subscribe({
            next: () => {
                const message = exclusion === 'OUI' ? 'exclu' : 'autorisé';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Médicament ${message} avec succès`
                });
                this.loadMedicaments();
            },
            error: (err) => {
                console.error('Erreur validation médicament:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Échec de la validation du médicament'
                });
            }
        });
    }

    /**
     * Valider un examen
     * @param id ID de l'examen
     * @param validationUab true = autorisation UAB requise (OUI), false = sans autorisation (NON)
     */
    validerExamen(id: number, validation: string): void {
        this.adminService.validerExamen(id, validation).subscribe({
            next: () => {
                const message = validation === 'OUI' ? 'avec autorisation requise' : 'sans autorisation';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Examen ${message}`
                });
                this.loadExamens();
            },
            error: (err) => {
                console.error('Erreur validation examen:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Échec de la validation de l\'examen'
                });
            }
        });
    }

    /**
     * Rafraîchir les deux listes (médicaments et examens)
     */
    refreshAll(): void {
        this.loadMedicaments();
        this.loadExamens();
        this.messageService.add({
            severity: 'info',
            summary: 'Rafraîchissement',
            detail: 'Listes mises à jour',
            life: 2000
        });
    }
}
