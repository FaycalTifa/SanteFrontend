import { Injectable } from '@angular/core';
import {Role, Utilisateur, UtilisateurRequest} from "../../models/utilisateur";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../auth/auth.service";
import {Observable} from "rxjs";
import {Structure} from "../../models/structure";

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

    private baseUrl = 'http://localhost:8080/api';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    getAllUtilisateurs(): Observable<Utilisateur[]> {
        return this.http.get<Utilisateur[]>(`${this.baseUrl}/utilisateurs`, { headers: this.getHeaders() });
    }

    getUtilisateurById(id: number): Observable<Utilisateur> {
        return this.http.get<Utilisateur>(`${this.baseUrl}/utilisateurs/${id}`, { headers: this.getHeaders() });
    }

    createUtilisateur(request: UtilisateurRequest): Observable<Utilisateur> {
        return this.http.post<Utilisateur>(`${this.baseUrl}/utilisateurs`, request, { headers: this.getHeaders() });
    }

    updateUtilisateur(id: number, request: UtilisateurRequest): Observable<Utilisateur> {
        return this.http.put<Utilisateur>(`${this.baseUrl}/utilisateurs/${id}`, request, { headers: this.getHeaders() });
    }

    desactiverUtilisateur(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/utilisateurs/${id}`, { headers: this.getHeaders() });
    }

    activerUtilisateur(id: number): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/utilisateurs/${id}/activer`, {}, { headers: this.getHeaders() });
    }

    getAllStructures(): Observable<Structure[]> {
        return this.http.get<Structure[]>(`${this.baseUrl}/structures`, { headers: this.getHeaders() });
    }

    // Dans la classe
    getAllRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(`${this.baseUrl}/utilisateurs/roles`, { headers: this.getHeaders() });
    }
}
