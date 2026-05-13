import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuardsGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    // guards.guard.ts
    canActivate(): boolean {
        const token = this.authService.getToken();
        if (token && !this.authService.isTokenExpired()) {
            return true;
        }
        this.authService.logout(); // Nettoie le stockage
        this.router.navigate(['/login']);
        return false;
    }
}
