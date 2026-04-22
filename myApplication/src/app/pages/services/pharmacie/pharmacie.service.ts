// services/pharmacie/pharmacie.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PharmacieDelivranceRequest, PrescriptionMedicament } from '../../models/prescription';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class PharmacieService {

    private baseUrl = 'http://localhost:8080/api/pharmacie';

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


    // services/pharmacie/pharmacie.service.ts
    /**
     * ✅ RECHERCHE PAR CRITÈRES (CODEINTE, police, code risque, codeMemb optionnel)
     */
    rechercherParPoliceEtCodeInte(numPolice: string, codeInte: string, codeRisq: string, codeMemb?: string): Observable<PrescriptionMedicament[]> {
        let params = new HttpParams();
        if (numPolice) params = params.set('numPolice', numPolice);
        if (codeInte) params = params.set('codeInte', codeInte);
        if (codeRisq) params = params.set('codeRisq', codeRisq);
        if (codeMemb) params = params.set('codeMemb', codeMemb);  // ✅ Ajouter codeMemb

        console.log('Paramètres recherche pharmacie:', { numPolice, codeInte, codeRisq, codeMemb });

        return this.http.get<PrescriptionMedicament[]>(`${this.baseUrl}/recherche-complete`, { headers: this.getHeaders(), params });
    }

    /**
     * Récupérer les prescriptions en attente
     */
    getPrescriptionsEnAttente(): Observable<PrescriptionMedicament[]> {
        return this.http.get<PrescriptionMedicament[]>(
            `${this.baseUrl}/prescriptions-attente`,
            { headers: this.getHeaders() }
        );
    }

    /**
     * Rechercher des prescriptions par numéro de police
     */
    getPrescriptionsByPolice(numeroPolice: string): Observable<PrescriptionMedicament[]> {
        return this.http.get<PrescriptionMedicament[]>(
            `${this.baseUrl}/recherche/${numeroPolice}`,
            { headers: this.getHeaders() }
        );
    }

    /**
     * Récupérer une prescription par ID
     */
    getPrescriptionById(id: number): Observable<PrescriptionMedicament> {
        return this.http.get<PrescriptionMedicament>(`${this.baseUrl}/prescriptions/${id}`, { headers: this.getHeaders() });
    }

    /**
     * Délivrer un médicament
     */
    delivrerMedicament(request: any): Observable<any> {
        return this.http.post(
            `${this.baseUrl}/delivrer`,
            request,
            { headers: this.getHeaders() }
        );
    }

    /**
     * Récupérer TOUTES les prescriptions (délivrées et non délivrées)
     */
    getAllPrescriptions(): Observable<PrescriptionMedicament[]> {
        return this.http.get<PrescriptionMedicament[]>(`${this.baseUrl}/toutes-prescriptions`, { headers: this.getHeaders() });
    }

    /**
     * Historique des délivrances
     */
    getHistorique(): Observable<PrescriptionMedicament[]> {
        return this.http.get<PrescriptionMedicament[]>(`${this.baseUrl}/historique`, { headers: this.getHeaders() });
    }
}
