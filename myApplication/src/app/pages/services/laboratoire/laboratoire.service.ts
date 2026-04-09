import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {LaboratoireRealisationRequest, PrescriptionExamen} from '../../models/prescription';
import {PaiementLaboratoire} from '../../models/laboratoire';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LaboratoireService {

    private baseUrl = 'http://localhost:8080/api/laboratoire';

    constructor(
        private http: HttpClient,
        private authService: AuthService  // ← AJOUTER
    ) {}

    getExamensEnAttente(): Observable<PrescriptionExamen[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/examens-attente`, { headers });
    }

    rechercherParPolice(numeroPolice: string): Observable<PrescriptionExamen[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/recherche/${numeroPolice}`, { headers });
    }

    getExamenById(id: number): Observable<PrescriptionExamen> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen>(`${this.baseUrl}/examens/${id}`, { headers });
    }

    // laboratoire.service.ts
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

   /* enregistrerPaiement(paiement: any): Observable<PrescriptionExamen> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.post<PrescriptionExamen>(`${this.baseUrl}/paiement`, paiement, { headers });
    }
*/
    enregistrerPaiement(paiement: any): Observable<PrescriptionExamen> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
        // ✅ Utiliser le bon endpoint /caissier/paiement
        return this.http.post<PrescriptionExamen>(`${this.baseUrl}/caissier/paiement`, paiement, { headers });
    }

    /**
     * Récupérer les examens en attente de paiement (pour caissier laboratoire)
     */
    getExamensEnAttentePaiement(): Observable<PrescriptionExamen[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/caissier/examens-attente-paiement`, { headers });
    }

    /**
     * Récupérer les examens payés en attente de réalisation (pour biologiste)
     */
    getExamensPayesEnAttente(): Observable<PrescriptionExamen[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/biologiste/examens-payes-attente`, { headers });
    }
}
