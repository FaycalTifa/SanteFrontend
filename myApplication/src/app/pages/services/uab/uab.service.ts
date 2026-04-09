import { Injectable } from '@angular/core';
import {Consultation} from '../../models/consultation';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {Observable} from 'rxjs';
import {DashboardStats} from '../../models/DashboardStats';

@Injectable({
  providedIn: 'root'
})
export class UabService {

    private baseUrl = 'http://localhost:8080/api/uab';

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

    getDashboard(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard`, { headers: this.getHeaders() });
    }

    getAllDossiers(statut?: string, numeroPolice?: string): Observable<Consultation[]> {
        let url = `${this.baseUrl}/dossiers`;
        const params: string[] = [];
        if (statut) { params.push(`statut=${statut}`); }
        if (numeroPolice) { params.push(`numeroPolice=${numeroPolice}`); }
        if (params.length) { url += `?${params.join('&')}`; }
        return this.http.get<Consultation[]>(url, { headers: this.getHeaders() });
    }

    validerDossier(id: number, commentaire?: string): Observable<any> {
        let url = `${this.baseUrl}/dossiers/${id}/valider`;
        if (commentaire) { url += `?commentaire=${encodeURIComponent(commentaire)}`; }
        return this.http.put(url, {}, { headers: this.getHeaders() });
    }

    rejeterDossier(id: number, motif: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/dossiers/${id}/rejeter?motif=${encodeURIComponent(motif)}`, {}, { headers: this.getHeaders() });
    }

    getDossierDetail(id: number): Observable<Consultation> {
        return this.http.get<Consultation>(`${this.baseUrl}/dossiers/${id}`, { headers: this.getHeaders() });
    }
}
