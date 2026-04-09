// assure.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthService} from "../auth/auth.service";

@Injectable({
    providedIn: 'root'
})
export class AssureService {

    private baseUrl = 'http://localhost:8080/api/assures';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    /**
     * ✅ Rechercher un patient par numéro de police
     */
    rechercherParPolice(numeroPolice: string): Observable<any> {
        const headers = this.getHeaders();
        console.log('Recherche patient par police:', numeroPolice);
        return this.http.get(`${this.baseUrl}/police/${numeroPolice}`, { headers });
    }

    /**
     * Rechercher un patient par numéro de téléphone
     */
    rechercherParTelephone(telephone: string): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(`${this.baseUrl}/telephone/${telephone}`, { headers });
    }
}
