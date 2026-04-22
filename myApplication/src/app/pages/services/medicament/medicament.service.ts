// services/medicament/medicament.service.ts
import { Injectable } from '@angular/core';
import { Medicament } from '../../models/medicament';
import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class MedicamentService {

    private endpoint = 'http://localhost:8080/api/medicaments';

    constructor(
        private api: ApiService,
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

    // ✅ Ajouter cette méthode - Rechercher les médicaments autorisés (exclusion = 'NON')
    searchAutorises(keyword: string): Observable<Medicament[]> {
        const headers = this.getHeaders();
        const params = new HttpParams().set('keyword', keyword);
        return this.http.get<Medicament[]>(`${this.endpoint}/search-autorises`, { headers, params });
    }

    // ✅ Ajouter cette méthode - Récupérer tous les médicaments autorisés
    getAllAutorises(): Observable<Medicament[]> {
        const headers = this.getHeaders();
        return this.http.get<Medicament[]>(`${this.endpoint}/autorises`, { headers });
    }

    search(keyword: string): Observable<Medicament[]> {
        const headers = this.getHeaders();
        const params = new HttpParams().set('keyword', keyword);
        return this.http.get<Medicament[]>(`${this.endpoint}/search`, { headers, params });
    }

    getAll(): Observable<Medicament[]> {
        const headers = this.getHeaders();
        return this.http.get<Medicament[]>(`${this.endpoint}`, { headers });
    }

    getById(id: number): Observable<Medicament> {
        return this.api.get(`${this.endpoint}/${id}`);
    }

    create(medicament: { forme: string; dosage: string; actif: boolean; nom: string }): Observable<Medicament> {
        const headers = this.getHeaders();
        return this.http.post<Medicament>(`${this.endpoint}`, medicament, { headers });
    }

    update(id: number, medicament: Medicament): Observable<Medicament> {
        return this.api.put(`${this.endpoint}/${id}`, medicament);
    }

    delete(id: number): Observable<void> {
        return this.api.delete(`${this.endpoint}/${id}`);
    }
}
