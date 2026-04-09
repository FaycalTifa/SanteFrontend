import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PharmacieDelivranceRequest, PrescriptionMedicament} from '../../models/prescription';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PharmacieService {

    pprivate; baseUrl = 'http://localhost:8080/api/pharmacie';

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
     * Récupérer les prescriptions en attente
     */
    getPrescriptionsEnAttente(): Observable<PrescriptionMedicament[]> {
        return this.http.get<PrescriptionMedicament[]>(
            `${this.baseUrl}/prescriptions-attente`,
            { headers: this.getHeaders() }
        );
    }
    /**
     * ✅ Rechercher des prescriptions par numéro de police
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

    // pharmacie.service.ts
    /**
     * Récupérer TOUTES les prescriptions (délivrées et non délivrées)
     */
    getAllPrescriptions(): Observable<PrescriptionMedicament[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionMedicament[]>(`${this.baseUrl}/pharmacie/toutes-prescriptions`, { headers });
    }

    /**
     * Historique des délivrances
     */
    getHistorique(): Observable<PrescriptionMedicament[]> {
        return this.http.get<PrescriptionMedicament[]>(`${this.baseUrl}/historique`, { headers: this.getHeaders() });
    }
}
