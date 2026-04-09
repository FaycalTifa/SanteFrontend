// pages/core/RoleGuard/role.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const requiredRoles = route.data['roles'] as Array<string>;
        const user = this.authService.getCurrentUser();

        if (!user) {
            this.router.navigate(['/login']);
            return false;
        }

        // ✅ Vérifier si l'utilisateur a au moins un des rôles requis
        const userRoles = user.roles || [];
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

        if (hasRequiredRole) {
            return true;
        }

        // ✅ Rediriger vers la première page disponible selon les rôles de l'utilisateur
        this.redirectByUserRoles(userRoles);
        return false;
    }

    // ✅ Redirection basée sur tous les rôles de l'utilisateur
    private redirectByUserRoles(roles: string[]): void {
        if (roles.includes('UAB_ADMIN')) {
            this.router.navigate(['/uab/dashboard']);
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
        } else {
            this.router.navigate(['/login']);
        }
    }
}
