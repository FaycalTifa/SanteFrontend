// auth.interceptor.ts
import { Injectable } from '@angular/core';
import {HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {AuthService} from '../../services/auth/auth.service';
import {catchError} from "rxjs/operators";
import {Router} from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getToken();

        console.log('=== INTERCEPTEUR HTTP ===');
        console.log('URL:', req.url);
        console.log('Token présent:', !!token);

        let authReq = req;
        if (token) {
            authReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`)
            });
            console.log('✅ Token ajouté à la requête');
        } else {
            console.log('⚠️ Aucun token trouvé');
        }

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                // 🔴 Si erreur 401 (Non autorisé) ou 403 (Interdit)
                if (error.status === 401 || error.status === 403) {
                    console.log('🔐 Session expirée ou non autorisé - Redirection vers login');

                    // Déconnecter l'utilisateur
                    this.authService.logout();

                    // Rediriger vers la page de connexion
                    this.router.navigate(['/login']);
                }
                return throwError(() => error);
            })
        );
    }
}
