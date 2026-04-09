import { Component, OnInit } from '@angular/core';
import { PrescriptionExamen } from '../../../models/prescription';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LaboratoireService } from '../../../services/laboratoire/laboratoire.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
    selector: 'app-examens-attente',
    templateUrl: './examens-attente.component.html',
    styleUrls: ['./examens-attente.component.scss']
})
export class ExamensAttenteComponent implements OnInit {

    examens: PrescriptionExamen[] = [];
    filteredExamens: PrescriptionExamen[] = [];
    loading = false;
    searchPolice = '';
    currentUser: any;
    isBiologiste = false;
    isCaissier = false;

    // Filtres
    filterOptions = [
        { label: 'Tous', value: 'all' },
        { label: 'En attente de paiement', value: 'unpaid' },
        { label: 'Réglés', value: 'paid' }
    ];
    currentFilter = 'all';

    constructor(
        private laboratoireService: LaboratoireService,
        private router: Router,
        private messageService: MessageService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();

        const userRoles = this.currentUser?.roles || [];
        this.isBiologiste = userRoles.includes('BIOLOGISTE');
        this.isCaissier = userRoles.includes('CAISSIER_LABORATOIRE');

        console.log('=== EXAMENS ATTENTE COMPONENT ===');
        console.log('Utilisateur:', this.currentUser);
        console.log('Rôles:', userRoles);
        console.log('Est biologiste:', this.isBiologiste);
        console.log('Est caissier:', this.isCaissier);

        this.loadExamens();
    }

    // Ajoutez ces méthodes dans votre composant

// Compter les examens en attente de paiement
    getPendingCount(): number {
        return this.filteredExamens.filter(e => !e.paye).length;
    }

// Compter les examens réglés
    getPaidCount(): number {
        return this.filteredExamens.filter(e => e.paye).length;
    }

    loadExamens(): void {
        this.loading = true;

        if (this.isCaissier) {
            this.loadExamensEnAttentePaiement();
        } else if (this.isBiologiste) {
            this.loadExamensPayesEnAttente();
        } else {
            this.loadExamensSimples();
        }
    }

    loadExamensSimples(): void {
        this.laboratoireService.getExamensEnAttente().subscribe({
            next: (data) => {
                this.examens = data;
                this.applyFilters();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les examens'
                });
            }
        });
    }

    loadExamensEnAttentePaiement(): void {
        this.laboratoireService.getExamensEnAttentePaiement().subscribe({
            next: (data) => {
                this.examens = data;
                this.applyFilters();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les examens en attente de paiement'
                });
            }
        });
    }

    loadExamensPayesEnAttente(): void {
        this.laboratoireService.getExamensPayesEnAttente().subscribe({
            next: (data) => {
                this.examens = data;
                this.applyFilters();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les examens payés en attente'
                });
            }
        });
    }

    rechercher(): void {
        if (this.searchPolice.trim()) {
            this.loading = true;
            this.laboratoireService.rechercherParPolice(this.searchPolice).subscribe({
                next: (data) => {
                    console.log('=== RÉSULTAT RECHERCHE ===');
                    console.log('Données reçues:', data);
                    console.log('Statut paye de chaque examen:');
                    data.forEach(e => {
                        console.log(`  - Examen ${e.id}: paye = ${e.paye}`);
                    });

                    this.examens = data;
                    this.applyFilters();
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de rechercher'
                    });
                }
            });
        } else {
            this.loadExamens();
        }
    }

    resetSearch(): void {
        this.searchPolice = '';
        this.currentFilter = 'all';
        this.loadExamens();
    }

    applyFilters(): void {
        let result = [...this.examens];

        // Filtre par recherche
        if (this.searchPolice.trim()) {
            result = result.filter(e =>
                e.patientPolice?.toLowerCase().includes(this.searchPolice.toLowerCase())
            );
        }

        // Filtre par statut de paiement
        if (this.currentFilter === 'paid') {
            result = result.filter(e => e.paye === true);
        } else if (this.currentFilter === 'unpaid') {
            result = result.filter(e => e.paye === false);
        }

        this.filteredExamens = result;
    }

    onFilterChange(value: string): void {
        this.currentFilter = value;
        this.applyFilters();
    }

    action(examen: PrescriptionExamen): void {
        console.log('=== ACTION DÉCLENCHÉE ===');
        console.log('Examen ID:', examen.id);
        console.log('Payé:', examen.paye);
        console.log('isCaissier:', this.isCaissier);
        console.log('isBiologiste:', this.isBiologiste);

        if (this.isCaissier) {
            if (examen.paye) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Attention',
                    detail: 'Cet examen a déjà été payé'
                });
                return;
            }
            this.allerVersCaisse(examen);
        } else if (this.isBiologiste) {
            if (!examen.paye) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Attention',
                    detail: 'Cet examen doit d\'abord être payé avant réalisation'
                });
                return;
            }
            this.allerVersRealisation(examen);
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Vous n\'avez pas les droits pour effectuer cette action'
            });
        }
    }

    allerVersCaisse(examen: PrescriptionExamen): void {
        console.log('Redirection vers caisse pour examen:', examen.id);
        this.router.navigate(['/laboratoire/caisse', examen.id]);
    }

    allerVersRealisation(examen: PrescriptionExamen): void {
        console.log('Redirection vers réalisation pour examen:', examen.id);
        this.router.navigate(['/laboratoire/realisation', examen.id]);
    }
}
