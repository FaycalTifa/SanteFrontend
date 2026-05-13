import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {MessageService} from 'primeng/api';
import {LoginRequest, LoginResponse} from '../../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private apiUrl = '/api/auth';
    private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router,
        private messageService: MessageService
    ) {
        this.loadStoredUser();
    }

    private loadStoredUser(): void {
        const storedUser = localStorage.getItem('currentUser');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                const user = JSON.parse(storedUser);
                this.currentUserSubject.next(user);
            } catch (e) {
                this.clearStorage();
            }
        }
    }



    // ✅ Restaurer l'utilisateur après rechargement
    restoreUser(user: LoginResponse): void {
        this.currentUserSubject.next(user);
        // Mettre à jour le localStorage si nécessaire
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
    // auth.service.ts
    isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) { return true; }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000;
            return Date.now() > exp;
        } catch (e) {
            return true;
        }
    }

    // auth.service.ts
    decodeToken(token: string): LoginResponse | null {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.id || 0,
                email: payload.sub || '',
                nom: payload.nom || '',
                prenom: payload.prenom || '',
                roles: payload.roles || [],
                rolesLabels: payload.rolesLabels || payload.roles || [],  // ✅ Ajouté
                type: payload.type || 'USER',                            // ✅ Ajouté
                structureId: payload.structureId || null,                // ✅ Ajouté
                structureNom: payload.structureNom || '',                // ✅ Ajouté
                token
            };
        } catch (e) {
            console.error('Erreur décodage token:', e);
            return null;
        }
    }

    login(request: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
            tap(response => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('currentUser', JSON.stringify(response));
                this.currentUserSubject.next(response);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Connexion réussie',
                    detail: `Bienvenue ${response.prenom} ${response.nom}`
                });

                // ✅ Rediriger en fonction de tous les rôles
                this.redirectByRoles(response.roles);
            })
        );
    }

    logout(): void {
        this.clearStorage();
        this.currentUserSubject.next(null);

        this.messageService.add({
            severity: 'info',
            summary: 'Déconnexion',
            detail: 'Vous êtes déconnecté'
        });

        this.router.navigate(['/login']);
    }

    private clearStorage(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getCurrentUser(): LoginResponse | null {
        return this.currentUserSubject.value;
    }

    // ✅ Vérifier si l'utilisateur a un rôle spécifique
    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.roles?.includes(role) || false;
    }

    // ✅ Vérifier si l'utilisateur a au moins un des rôles
    hasAnyRole(roles: string[]): boolean {
        const user = this.getCurrentUser();
        return user ? roles.some(r => user.roles?.includes(r)) : false;
    }

    // ✅ Nouvelle méthode de redirection basée sur les rôles
    private redirectByRoles(roles: string[]): void {
        // Priorité des redirections (ordre d'importance)
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
