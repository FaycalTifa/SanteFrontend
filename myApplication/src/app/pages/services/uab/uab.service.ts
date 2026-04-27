// services/uab/uab.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class UabService {

    private baseUrl = 'http://localhost:8080/api';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    getDashboard(): Observable<any> {
        return this.http.get(`${this.baseUrl}/uab/dashboard`, { headers: this.getHeaders() });
    }

    getAllDossiers(statut?: string, numeroPolice?: string): Observable<any[]> {
        let url = `${this.baseUrl}/uab/dossiers`;
        const params: string[] = [];
        if (statut) { params.push(`statut=${statut}`); }
        if (numeroPolice) { params.push(`numeroPolice=${numeroPolice}`); }
        if (params.length) { url += `?${params.join('&')}`; }
        return this.http.get<any[]>(url, { headers: this.getHeaders() });
    }

    getStructures(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/structures`, { headers: this.getHeaders() });
    }

    validerDossier(id: number, type: string, commentaire?: string): Observable<any> {
        let params = new HttpParams().set('type', type);
        if (commentaire) {
            params = params.set('commentaire', commentaire);
        }
        return this.http.put(`${this.baseUrl}/uab/dossiers/${id}/valider`, {}, {
            headers: this.getHeaders(),
            params
        });
    }

    rejeterDossier(id: number, type: string, motif: string): Observable<any> {
        const params = new HttpParams()
            .set('type', type)
            .set('motif', motif);
        return this.http.put(`${this.baseUrl}/uab/dossiers/${id}/rejeter`, {}, {
            headers: this.getHeaders(),
            params
        });
    }

    getAllDossiersPaginated(page: number = 0, size: number = 10,
                            statut?: string, numeroPolice?: string): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        if (statut) params = params.set('statut', statut);
        if (numeroPolice) params = params.set('numeroPolice', numeroPolice);

        return this.http.get<any>(`${this.baseUrl}/uab/dossiers/paginated`, {
            headers: this.getHeaders(),
            params
        });
    }
}
