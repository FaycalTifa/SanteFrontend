import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from '../api/api.service';
import {Examen} from '../../models/examen';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExamenService {

    private endpoint = 'http://localhost:8080/api/examens';

    constructor(private api: ApiService,
                private http: HttpClient,
                private authService: AuthService) {}

    search(keyword: string): Observable<Examen[]> {
        const headers = this.getHeaders();
        const params = new HttpParams().set('keyword', keyword);
        return this.http.get<Examen[]>(`${this.endpoint}/search`, { headers, params });
    }

    getAll(): Observable<Examen[]> {
        const headers = this.getHeaders();
        return this.http.get<Examen[]>(`${this.endpoint}`, { headers });
    }

    getById(id: number): Observable<Examen> {
        return this.api.get(`${this.endpoint}/${id}`);
    }

    create(examen: Partial<Examen>): Observable<Examen> {
        const headers = this.getHeaders();
        return this.http.post<Examen>(`${this.endpoint}`, examen, { headers });
    }
    update(id: number, examen: Examen): Observable<Examen> {
        return this.api.put(`${this.endpoint}/${id}`, examen);
    }

    delete(id: number): Observable<void> {
        return this.api.delete(`${this.endpoint}/${id}`);
    }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    /**
     * Récupérer tous les examens
     */
    getAllExamens(): Observable<Examen[]> {
        const headers = this.getHeaders();
        return this.http.get<Examen[]>(`${this.endpoint}`, { headers });
    }

    /**
     * ✅ Rechercher des examens par nom ou code
     */
    searchExamens(keyword: string): Observable<Examen[]> {
        const headers = this.getHeaders();
        const params = new HttpParams().set('keyword', keyword);
        return this.http.get<Examen[]>(`${this.endpoint}/search`, { headers, params });
    }

    /**
     * ✅ Créer un nouvel examen
     */
    createExamen(examen: Partial<Examen>): Observable<Examen> {
        const headers = this.getHeaders();
        return this.http.post<Examen>(`${this.endpoint}`, examen, { headers });
    }

    /**
     * Récupérer un examen par ID
     */
    getExamenById(id: number): Observable<Examen> {
        const headers = this.getHeaders();
        return this.http.get<Examen>(`${this.endpoint}/${id}`, { headers });
    }
}
