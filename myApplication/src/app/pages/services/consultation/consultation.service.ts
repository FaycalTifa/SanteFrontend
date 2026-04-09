// services/consultation/consultation.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TauxCouvertureService } from '../TauxCouverture/taux-couverture.service';
import { Consultation, ConsultationCaisseRequest, ConsultationPrescriptionRequest } from '../../models/consultation';
import {
    LaboratoireRealisationRequest,
    PharmacieDelivranceRequest,
    PrescriptionExamen,
    PrescriptionMedicament
} from '../../models/prescription';
import {PoliceTaux} from '../../models/TauxCouverture';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class ConsultationService {

    private baseUrl = 'http://localhost:8080/api';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    // Caisse Hôpital
    createByCaisse(request: ConsultationCaisseRequest): Observable<Consultation> {
        return this.http.post<Consultation>(`${this.baseUrl}/consultations/caisse`, request);
    }

    // Médecin
    addPrescriptions(id: number, request: ConsultationPrescriptionRequest): Observable<Consultation> {
        return this.http.put<Consultation>(`${this.baseUrl}/consultations/${id}/prescriptions`, request);
    }

    getConsultationsEnAttente(): Observable<Consultation[]> {
        return this.http.get<Consultation[]>(`${this.baseUrl}/consultations/medecin/attente`);
    }

    /**
     * Récupérer les examens réalisés par numéro de police pour interprétation
     */
    getExamensRealisesByPolice(numeroPolice: string): Observable<PrescriptionExamen[]> {
        console.log('getExamensRealisesByPolice - Police:', numeroPolice);
        // ✅ URL correcte - correspondant au nouveau endpoint
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/consultations/medecin/examens/police/${numeroPolice}`);
    }
    // Pharmacie
    delivrerMedicament(request: PharmacieDelivranceRequest): Observable<PrescriptionMedicament> {
        return this.http.post<PrescriptionMedicament>(`${this.baseUrl}/consultations/pharmacie/delivrer`, request);
    }

    getPrescriptionsByPolice(numeroPolice: string): Observable<PrescriptionMedicament[]> {
        console.log('getPrescriptionsByPolice - Police:', numeroPolice);
        // L'URL doit correspondre à l'endpoint du PharmacieController
        return this.http.get<PrescriptionMedicament[]>(`${this.baseUrl}/pharmacie/recherche/${numeroPolice}`);
    }

    // Laboratoire
    realiserExamen(request: LaboratoireRealisationRequest): Observable<PrescriptionExamen> {
        return this.http.post<PrescriptionExamen>(`${this.baseUrl}/consultations/laboratoire/realiser`, request);
    }

    getExamensByPolice(numeroPolice: string): Observable<PrescriptionExamen[]> {
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/consultations/laboratoire/police/${numeroPolice}`);
    }

    // Recherche par police
    getByPolice(numeroPolice: string): Observable<Consultation[]> {
        return this.http.get<Consultation[]>(`${this.baseUrl}/consultations/police/${numeroPolice}`);
    }

    // Détail consultation
    getById(id: number): Observable<Consultation> {
        return this.http.get<Consultation>(`${this.baseUrl}/consultations/${id}`);
    }

    // UAB
    getAllForUAB(statut?: string, numeroPolice?: string): Observable<Consultation[]> {
        let url = `${this.baseUrl}/consultations/uab`;
        const params: string[] = [];
        if (statut) { params.push(`statut=${statut}`); }
        if (numeroPolice) { params.push(`numeroPolice=${numeroPolice}`); }
        if (params.length) { url += `?${params.join('&')}`; }
        return this.http.get<Consultation[]>(url);
    }
    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        console.log('Token dans getHeaders:', token ? 'Présent' : 'Absent');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }
    // services/consultation/consultation.service.ts
    valider(id: number): Observable<Consultation> {
        console.log('---------VAL REMB SERV ------------');
        console.log('ID reçu:', id);
        console.log('URL:', `${this.baseUrl}/consultations/${id}/valider`);

        const headers = this.getHeaders();
        console.log('Headers:', headers);

        return this.http.put<Consultation>(`${this.baseUrl}/consultations/${id}/valider`, {}, { headers });
    }
    rejeter(id: number, motif: string): Observable<Consultation> {
        return this.http.put<Consultation>(`${this.baseUrl}/consultations/${id}/rejeter?motif=${motif}`, {});
    }

    // consultation.service.ts
    getAllDossiersUAB(statut?: string, numeroPolice?: string): Observable<any[]> {
        let url = `${this.baseUrl}/uab/dossiers`;
        const params: string[] = [];
        if (statut) { params.push(`statut=${statut}`); }
        if (numeroPolice) { params.push(`numeroPolice=${numeroPolice}`); }
        if (params.length) { url += `?${params.join('&')}`; }
        return this.http.get<any[]>(url);
    }

}
