// app.menu.component.ts
import { Component, OnInit } from '@angular/core';
import { AppComponent } from './app.component';
import { AuthService } from './pages/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-menu',
    template: `
        <ul class="layout-menu">
            <li app-menuitem *ngFor="let item of model; let i = index;" [item]="item" [index]="i" [root]="true"></li>
        </ul>
    `
})
export class AppMenuComponent implements OnInit {
    model: any[];

    constructor(
        public app: AppComponent,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadMenu();
        this.authService.currentUser$.subscribe(() => {
            this.loadMenu();
        });
    }

    loadMenu() {
        const user = this.authService.getCurrentUser();
        const roles = user?.roles || [];

        const hasRole = (role: string) => roles.includes(role);

        const menuItems: any[] = [];

        // ==================== SECTION POUR TOUS LES UTILISATEURS ====================
        // ✅ Plafonnement accessible à TOUS
        const commonItems: any[] = [];

        if (hasRole('UAB_ADMIN') || hasRole('OPERATEUR_UAB') || hasRole('MEDECIN_CONSEIL') ||
            hasRole('ADMIN_STRUCTURE') || hasRole('MEDECIN') || hasRole('PHARMACIEN') ||
            hasRole('BIOLOGISTE') || hasRole('CAISSIER_HOPITAL') || hasRole('CAISSIER_PHARMACIE') ||
            hasRole('CAISSIER_LABORATOIRE')) {
            commonItems.push({ label: 'Plafonnements', icon: 'pi pi-chart-line', routerLink: ['/caisse-hopital/plafonnements'] });
        }

        if (commonItems.length > 0) {
            menuItems.push({
                label: 'COMMUN',
                icon: 'pi pi-fw pi-globe',
                items: commonItems
            });
        }

        // ==================== OPERATEUR_UAB ====================
        if (hasRole('OPERATEUR_UAB')) {
            menuItems.push({
                label: 'UAB - OPÉRATEUR',
                icon: 'pi pi-fw pi-user',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-chart-line', routerLink: ['/uab/dashboard'] },
                    { label: 'Dashboard payés', icon: 'pi pi-chart-line', routerLink: ['/uab/dashboard/payes'] },
                    { label: 'Dossiers payés', icon: 'pi pi-folder-open', routerLink: ['/uab/dossiers/payes'] },
                    { label: 'Gestion des dossiers', icon: 'pi pi-folder', routerLink: ['/uab/dossiers'] },
                    { label: 'Validation dossier', icon: 'pi pi-check-circle', routerLink: ['/uab/validation'] }
                ]
            });
        }

        // ==================== MEDECIN_CONSEIL ====================
        if (hasRole('MEDECIN_CONSEIL')) {
            menuItems.push({
                label: 'MÉDECIN CONSEIL',
                icon: 'pi pi-fw pi-user-md',
                items: [
                    { label: 'Validation des examens', icon: 'pi pi-shield', routerLink: ['/uab/validation/examen'] },
                    { label: 'Nouvelle Prescription', icon: 'pi pi-shield', routerLink: ['/uab/admin-vaalidation-prescription'] }
                ]
            });
        }

        // ==================== UAB_ADMIN ====================
        if (hasRole('UAB_ADMIN')) {
            menuItems.push({
                label: 'UAB - ADMINISTRATION',
                icon: 'pi pi-fw pi-shield',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-chart-line', routerLink: ['/uab/dashboard'] },
                    { label: 'Gestion des dossiers', icon: 'pi pi-folder-open', routerLink: ['/uab/dossiers'] },
                    { label: 'Dashboard payés', icon: 'pi pi-chart-line', routerLink: ['/uab/dashboard/payes'] },
                    { label: 'Dossiers payés', icon: 'pi pi-folder-open', routerLink: ['/uab/dossiers/payes'] },
                    { label: 'Validation examen', icon: 'pi pi-building', routerLink: ['/uab/validation/examen'] },
                    { label: 'Import Medicament', icon: 'pi pi-upload', routerLink: ['/uab/parametres/import-medicaments'] },
                    { label: 'Nouvelle Prescription', icon: 'pi pi-upload', routerLink: ['/uab/admin-vaalidation-prescription'] },
                    { label: 'Structures', icon: 'pi pi-building', routerLink: ['/uab/parametres/structures'] },
                    { label: 'Utilisateurs', icon: 'pi pi-users', routerLink: ['/uab/parametres/utilisateurs'] },
                    { label: 'Taux Couverture', icon: 'pi pi-percentage', routerLink: ['/uab/parametres/taux-couverture'] }
                ]
            });
        }

        // ==================== ADMIN_STRUCTURE ====================
        if (hasRole('ADMIN_STRUCTURE')) {
            menuItems.push({
                label: 'TABLEAU DE BORD',
                icon: 'pi pi-fw pi-chart-line',
                items: [
                    { label: 'Dashboard structure', icon: 'pi pi-chart-line', routerLink: ['/structure/dashboard'] }
                ]
            });
        }

        // ==================== MEDECIN ====================
        if (hasRole('MEDECIN')) {
            menuItems.push({
                label: 'MÉDECIN',
                icon: 'pi pi-fw pi-user-md',
                items: [
                    { label: 'Mes consultations', icon: 'pi pi-list', routerLink: ['/medecin/mes-consultations'] },
                    { label: 'Demande en attente', icon: 'pi pi-file', routerLink: ['/medecin/demandes-attente'] },
                ]
            });
        }

        // ==================== CAISSIER_HOPITAL ====================
        if (hasRole('CAISSIER_HOPITAL')) {
            menuItems.push({
                label: 'CAISSE HÔPITAL',
                icon: 'pi pi-fw pi-money-bill',
                items: [
                    { label: 'Nouvelle consultation', icon: 'pi pi-plus', routerLink: ['/caisse-hopital'] },
                    { label: 'Historique', icon: 'pi pi-history', routerLink: ['/caisse-hopital/historique'] },
                ]
            });
        }

        // ==================== PHARMACIEN ====================
        if (hasRole('PHARMACIEN')) {
            menuItems.push({
                label: 'PHARMACIE',
                icon: 'pi pi-fw pi-shopping-cart',
                items: [
                    { label: 'Prescriptions en attente', icon: 'pi pi-clock', routerLink: ['/pharmacie/prescriptions-attente'] },
                    { label: 'Historique délivrances', icon: 'pi pi-history', routerLink: ['/pharmacie/historique'] },
                ]
            });
        }

        // ==================== CAISSIER_PHARMACIE ====================
        if (hasRole('CAISSIER_PHARMACIE')) {
            menuItems.push({
                label: 'CAISSE PHARMACIE',
                icon: 'pi pi-fw pi-credit-card',
                items: [
                    { label: 'Prescriptions en attente', icon: 'pi pi-clock', routerLink: ['/pharmacie/prescriptions-attente'] },
                    { label: 'Historique', icon: 'pi pi-history', routerLink: ['/pharmacie/historique'] },
                ]
            });
        }

        // ==================== BIOLOGISTE ====================
        if (hasRole('BIOLOGISTE')) {
            menuItems.push({
                label: 'LABORATOIRE',
                icon: 'pi pi-fw pi-flask',
                items: [
                    { label: 'Examens en attente', icon: 'pi pi-clock', routerLink: ['/laboratoire/examens-attente'] },
                    { label: 'Historique', icon: 'pi pi-history', routerLink: ['/laboratoire/historique'] },
                ]
            });
        }

        // ==================== CAISSIER_LABORATOIRE ====================
        if (hasRole('CAISSIER_LABORATOIRE')) {
            menuItems.push({
                label: 'CAISSE LABORATOIRE',
                icon: 'pi pi-fw pi-money-bill',
                items: [
                    { label: 'Examens en attente', icon: 'pi pi-clock', routerLink: ['/laboratoire/examens-attente'] },
                    { label: 'Historique', icon: 'pi pi-history', routerLink: ['/laboratoire/historique'] },
                ]
            });
        }

        // ==================== DÉCONNEXION (toujours présent) ====================
        menuItems.push({
            label: 'DÉCONNEXION',
            icon: 'pi pi-fw pi-sign-out',
            items: [
                {
                    label: 'Se déconnecter',
                    icon: 'pi pi-power-off',
                    command: () => this.authService.logout()
                },
            ],
        });

        this.model = menuItems;
    }
}
