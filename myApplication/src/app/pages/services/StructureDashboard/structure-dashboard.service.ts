// structure-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StructureDashboardService {

    private baseUrl = 'http://localhost:8080/api';

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
     * Récupérer tous les dossiers de la structure
     */
    getAllDossiersStructure(payeParUab?: boolean): Observable<any[]> {
        let url = `${this.baseUrl}/structure/dossiers`;
        if (payeParUab !== undefined) {
            url += `?payeParUab=${payeParUab}`;
        }
        return this.http.get<any[]>(url, { headers: this.getHeaders() });
    }

    /**
     * ✅ Récupérer un dossier spécifique par son ID
     */
    // structure-dashboard.service.ts
    getDossierById(id: number, type?: string): Observable<any> {
        let url = `${this.baseUrl}/structure/dossier/${id}`;
        if (type) {
            url += `?type=${type}`;
        }
        console.log('Appel API structure getDossierById:', url);
        return this.http.get<any>(url, { headers: this.getHeaders() });
    }

    /**
     * ✅ Valider un dossier
     */
    validerDossier(id: number, type: string, commentaire?: string): Observable<any> {
        let params = new HttpParams().set('type', type);
        if (commentaire) {
            params = params.set('commentaire', commentaire);
        }
        return this.http.put(`${this.baseUrl}/structure/valider/${id}`, {}, { headers: this.getHeaders(), params });
    }

    /**
     * ✅ Rejeter un dossier
     */
    rejeterDossier(id: number, type: string, motif: string): Observable<any> {
        const params = new HttpParams()
            .set('type', type)
            .set('motif', motif);
        return this.http.put(`${this.baseUrl}/structure/rejeter/${id}`, {}, { headers: this.getHeaders(), params });
    }
}
