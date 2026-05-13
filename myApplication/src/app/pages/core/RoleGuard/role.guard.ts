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

        const userRoles = user.roles || [];

        // Si aucune role n'est requis, autoriser l'accès
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

        if (hasRequiredRole) {
            return true;
        }

        this.redirectByUserRoles(userRoles);
        return false;
    }

    private redirectByUserRoles(roles: string[]): void {
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
        } else {
            this.router.navigate(['/login']);
        }
    }
}
