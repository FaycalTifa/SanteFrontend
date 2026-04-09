// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthService} from '../../services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Récupérer le token depuis le localStorage
        const token = this.authService.getToken();

        console.log('=== INTERCEPTEUR HTTP ===');
        console.log('URL:', req.url);
        console.log('Token présent:', !!token);

        // Si le token existe, cloner la requête et ajouter l'en-tête Authorization
        if (token) {
            const clonedReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`)
            });
            console.log('✅ Token ajouté à la requête');
            return next.handle(clonedReq);
        }

        console.log('⚠️ Aucun token trouvé');
        return next.handle(req);
    }
}
