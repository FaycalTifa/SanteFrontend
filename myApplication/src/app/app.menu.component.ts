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

        // ✅ Initialiser le menu vide
        const menuItems: any[] = [];

        // ==================== ADMIN_STRUCTURE ====================
        if (hasRole('ADMIN_STRUCTURE')) {
            menuItems.push({
                label: 'TABLEAU DE BORD',
                icon: 'pi pi-fw pi-chart-line',
                items: [
                    { label: 'Dashboard structure', icon: 'pi pi-chart-line', routerLink: ['/structure/dashboard'] }
                ]
            });

            // ✅ Ajouter Plafonnements pour ADMIN_STRUCTURE
            menuItems.push({
                label: 'PARAMÈTRES',
                icon: 'pi pi-fw pi-cog',
                items: [
                    { label: 'Plafonnements', icon: 'pi pi-chart-line', routerLink: ['/caisse-hopital/plafonnements'] }
                ]
            });
        }

        // ==================== UAB_ADMIN (ADMIN) ====================
        // app.menu.component.ts - Corriger la route pour Validation examen

// ==================== UAB_ADMIN (ADMIN) ====================
        if (hasRole('UAB_ADMIN')) {
            menuItems.push({
                label: 'ADMINISTRATION',
                icon: 'pi pi-fw pi-shield',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-chart-line', routerLink: ['/uab/dashboard'] },
                    { label: 'Gestion des dossiers', icon: 'pi pi-folder-open', routerLink: ['/uab/dossiers'] },
                    { label: 'Plafonnements', icon: 'pi pi-chart-line', routerLink: ['/caisse-hopital/plafonnements'] },
                    { label: 'Validation examen', icon: 'pi pi-building', routerLink: ['/uab/validation/examen'] },
                    { label: 'Import Medicament', icon: 'pi pi-upload', routerLink: ['/uab/parametres/import-medicaments'] },
                    { label: 'Utilisateurs', icon: 'pi pi-users', routerLink: ['/uab/parametres/utilisateurs'] },
                    { label: 'Taux Couverture', icon: 'pi pi-percentage', routerLink: ['/uab/parametres/taux-couverture'] },
                    { label: 'Structures', icon: 'pi pi-building', routerLink: ['/uab/parametres/structures'] },
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
                    { label: 'Plafonnements', icon: 'pi pi-chart-line', routerLink: ['/caisse-hopital/plafonnements'] },
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
                    { label: 'Plafonnements', icon: 'pi pi-chart-line', routerLink: ['/caisse-hopital/plafonnements'] },
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
                    { label: 'Plafonnements', icon: 'pi pi-chart-line', routerLink: ['/caisse-hopital/plafonnements'] },
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
