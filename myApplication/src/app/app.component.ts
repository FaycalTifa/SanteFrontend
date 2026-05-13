import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { AuthService } from "./pages/services/auth/auth.service";
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

    topbarTheme = 'blue';
    menuTheme = 'light';
    layoutMode = 'light';
    menuMode = 'static';
    inlineMenuPosition = 'bottom';
    inputStyle = 'filled';
    ripple = true;
    isRTL = false;
    refreshGrid = false;

    constructor(
        private primengConfig: PrimeNGConfig,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit() {
        // ❌ SUPPRIMER CETTE LIGNE
        // this.authService.logout();

        this.primengConfig.ripple = true;

        // ✅ Vérifier la session au chargement
        this.checkSession();
    }

    private checkSession(): void {
        const token = this.authService.getToken();

        console.log('=== VÉRIFICATION SESSION AU CHARGEMENT ===');
        console.log('Token présent:', !!token);

        if (!token) {
            console.log('❌ Aucun token, redirection vers login');
            this.router.navigate(['/login']);
            return;
        }

        if (this.authService.isTokenExpired()) {
            console.log('❌ Token expiré, déconnexion');
            this.authService.logout();
            return;
        }

        // ✅ Token valide, restaurer l'utilisateur si nécessaire
        const user = this.authService.getCurrentUser();
        if (!user) {
            // Recharger l'utilisateur depuis le token
            const restoredUser = this.authService.decodeToken(token);
            if (restoredUser) {
                console.log('✅ Utilisateur restauré:', restoredUser.email);
                this.authService.restoreUser(restoredUser);

                // Rediriger si on est sur login
                if (this.router.url === '/login') {
                    this.redirectByRoles(restoredUser.roles);
                }
            }
        } else {
            console.log('✅ Utilisateur déjà connecté:', user.email);
        }
    }

    private redirectByRoles(roles: string[]): void {
        if (roles.includes('UAB_ADMIN')) {
            this.router.navigate(['/uab/dashboard']);
        } else if (roles.includes('OPERATEUR_UAB')) {
            this.router.navigate(['/uab/dashboard/payes']);
        } else if (roles.includes('MEDECIN_CONSEIL')) {
            this.router.navigate(['/uab/validation/examen']);
        } else if (roles.includes('MEDECIN')) {
            this.router.navigate(['/medecin/consultations-attente']);
        } else if (roles.includes('PHARMACIEN')) {
            this.router.navigate(['/pharmacie/prescriptions-attente']);
        } else if (roles.includes('BIOLOGISTE')) {
            this.router.navigate(['/laboratoire/examens-attente']);
        } else if (roles.includes('CAISSIER_HOPITAL')) {
            this.router.navigate(['/caisse-hopital']);
        } else if (roles.includes('CAISSIER_LABORATOIRE')) {
            this.router.navigate(['/laboratoire/examens-attente']);
        } else if (roles.includes('CAISSIER_PHARMACIE')) {
            this.router.navigate(['/pharmacie/prescriptions-attente']);
        } else if (roles.includes('ADMIN_STRUCTURE')) {
            this.router.navigate(['/structure/dashboard']);
        }
    }

    refreshList($event: any) {
        this.refreshGrid = true;
    }
}
