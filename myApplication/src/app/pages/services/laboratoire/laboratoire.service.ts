// laboratoire.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LaboratoireRealisationRequest, PrescriptionExamen } from '../../models/prescription';
import { PaiementLaboratoire } from '../../models/laboratoire';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class LaboratoireService {

    private baseUrl = 'http://localhost:8080/api/laboratoire';

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

    // ✅ NOUVELLE MÉTHODE : Recherche par CODEINTE, police et code risque
    // services/laboratoire/laboratoire.service.ts
    /**
     * Rechercher des examens par CODEINTE, police, code risque et codeMemb (optionnel)
     */
    rechercherParCriteres(numPolice: string, codeInte: string, codeRisq: string, codeMemb?: string): Observable<PrescriptionExamen[]> {
        let params = new HttpParams();
        if (numPolice) { params = params.set('numPolice', numPolice); }
        if (codeInte) { params = params.set('codeInte', codeInte); }
        if (codeRisq) { params = params.set('codeRisq', codeRisq); }
        if (codeMemb) { params = params.set('codeMemb', codeMemb); }  // ✅ Ajouter codeMemb

        console.log('Paramètres recherche laboratoire:', { numPolice, codeInte, codeRisq, codeMemb });

        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/recherche-complete`, { headers: this.getHeaders(), params });
    }

    getExamensEnAttente(): Observable<PrescriptionExamen[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/examens-attente`, { headers });
    }

    // services/laboratoire/laboratoire.service.ts - Ajouter

    getExamensValidesNonPayes(): Observable<PrescriptionExamen[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/caissier/examens-valides`, { headers });
    }
    getExamenById(id: number): Observable<PrescriptionExamen> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen>(`${this.baseUrl}/examens/${id}`, { headers });
    }

    realiserExamen(request: { prescriptionId: number; resultats: any[] }): Observable<PrescriptionExamen> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
        return this.http.post<PrescriptionExamen>(`${this.baseUrl}/biologiste/realiser`, request, { headers });
    }

    getHistorique(): Observable<PrescriptionExamen[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/historique`, { headers });
    }

    enregistrerPaiement(paiement: any): Observable<PrescriptionExamen> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
        return this.http.post<PrescriptionExamen>(`${this.baseUrl}/caissier/paiement`, paiement, { headers });
    }

    getExamensEnAttentePaiement(): Observable<PrescriptionExamen[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/caissier/examens-attente-paiement`, { headers });
    }

    getExamensPayesEnAttente(): Observable<PrescriptionExamen[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/biologiste/examens-payes-attente`, { headers });
    }
}
