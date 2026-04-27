// services/consultation/consultation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Consultation, ConsultationCaisseRequest, ConsultationPrescriptionRequest } from '../../models/consultation';
import { LaboratoireRealisationRequest, PharmacieDelivranceRequest, PrescriptionExamen, PrescriptionMedicament } from '../../models/prescription';

@Injectable({
    providedIn: 'root'
})
export class ConsultationService {

    private baseUrl = 'http://localhost:8080/api';

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

    // consultation.service.ts - Ajouter cette méthode

    /**
     * Récupérer les détails complets d'un dossier (avec prescriptions et médecin)
     */
    getDossierDetail(id: number, type?: string): Observable<any> {
        let url = `${this.baseUrl}/uab/dossier/${id}`;
        if (type) {
            url += `?type=${type}`;
        }
        console.log('Appel API:', url);
        return this.http.get<any>(url, { headers: this.getHeaders() });
    }
    // ==================== CAISSE HOPITAL ====================

    createByCaisse(request: ConsultationCaisseRequest): Observable<Consultation> {
        return this.http.post<Consultation>(`${this.baseUrl}/consultations/caisse`, request);
    }

    // ==================== MEDECIN ====================

    addPrescriptions(id: number, request: ConsultationPrescriptionRequest): Observable<Consultation> {
        return this.http.put<Consultation>(`${this.baseUrl}/consultations/${id}/prescriptions`, request);
    }

    getConsultationsEnAttente(numPolice?: string, codeInte?: string, codeRisq?: string, codeMemb?: string): Observable<Consultation[]> {
        let params = new HttpParams();
        if (numPolice) { params = params.set('numPolice', numPolice); }
        if (codeInte) { params = params.set('codeInte', codeInte); }
        if (codeRisq) { params = params.set('codeRisq', codeRisq); }
        if (codeMemb) { params = params.set('codeMemb', codeMemb); }
        return this.http.get<Consultation[]>(`${this.baseUrl}/consultations/medecin/attente`, { params });
    }

    getExamensRealisesByPolice(numeroPolice: string): Observable<PrescriptionExamen[]> {
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/consultations/medecin/examens/police/${numeroPolice}`);
    }

    // ==================== PHARMACIE ====================

    delivrerMedicament(request: PharmacieDelivranceRequest): Observable<PrescriptionMedicament> {
        return this.http.post<PrescriptionMedicament>(`${this.baseUrl}/pharmacie/delivrer`, request);
    }

    getPrescriptionsByPolice(numeroPolice: string): Observable<PrescriptionMedicament[]> {
        return this.http.get<PrescriptionMedicament[]>(`${this.baseUrl}/pharmacie/recherche/${numeroPolice}`);
    }

    // ==================== LABORATOIRE ====================

    realiserExamen(request: LaboratoireRealisationRequest): Observable<PrescriptionExamen> {
        return this.http.post<PrescriptionExamen>(`${this.baseUrl}/laboratoire/biologiste/realiser`, request);
    }

    getExamensByPolice(numeroPolice: string): Observable<PrescriptionExamen[]> {
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/laboratoire/recherche/${numeroPolice}`);
    }

    // ==================== CONSULTATIONS ====================

    getById(id: number): Observable<Consultation> {
        return this.http.get<Consultation>(`${this.baseUrl}/consultations/${id}`);
    }

    getByPolice(numeroPolice: string): Observable<Consultation[]> {
        return this.http.get<Consultation[]>(`${this.baseUrl}/consultations/police/${numeroPolice}`);
    }

    getAllForUAB(statut?: string, numeroPolice?: string): Observable<Consultation[]> {
        let url = `${this.baseUrl}/consultations/uab`;
        const params: string[] = [];
        if (statut) { params.push(`statut=${statut}`); }
        if (numeroPolice) { params.push(`numeroPolice=${numeroPolice}`); }
        if (params.length) { url += `?${params.join('&')}`; }
        return this.http.get<Consultation[]>(url);
    }

    // ==================== UAB VALIDATION (NOUVEAU) ====================

    /**
     * Valider un dossier (consultation, médicament ou examen)
     * @param id - ID du dossier
     * @param type - Type de dossier: 'CONSULTATION', 'PRESCRIPTION_MEDICAMENT', 'PRESCRIPTION_EXAMEN'
     * @param commentaire - Commentaire optionnel
     */
    validerDossier(id: number, type: string, commentaire?: string): Observable<any> {
        const headers = this.getHeaders();
        let params = new HttpParams().set('type', type);
        if (commentaire) {
            params = params.set('commentaire', commentaire);
        }
        console.log(`✅ Validation dossier - ID: ${id}, Type: ${type}`);
        return this.http.put(`${this.baseUrl}/uab/dossiers/${id}/valider`, {}, { headers, params });
    }

    /**
     * Rejeter un dossier (consultation, médicament ou examen)
     * @param id - ID du dossier
     * @param type - Type de dossier: 'CONSULTATION', 'PRESCRIPTION_MEDICAMENT', 'PRESCRIPTION_EXAMEN'
     * @param motif - Motif du rejet
     */
    rejeterDossier(id: number, type: string, motif: string): Observable<any> {
        const headers = this.getHeaders();
        const params = new HttpParams()
            .set('type', type)
            .set('motif', motif);
        console.log(`❌ Rejet dossier - ID: ${id}, Type: ${type}, Motif: ${motif}`);
        return this.http.put(`${this.baseUrl}/uab/dossiers/${id}/rejeter`, {}, { headers, params });
    }

    /**
     * Récupérer tous les dossiers pour l'UAB
     */
    getAllDossiersUAB(statut?: string, numeroPolice?: string): Observable<any[]> {
        let url = `${this.baseUrl}/uab/dossiers`;
        const params: string[] = [];
        if (statut) { params.push(`statut=${statut}`); }
        if (numeroPolice) { params.push(`numeroPolice=${numeroPolice}`); }
        if (params.length) { url += `?${params.join('&')}`; }
        return this.http.get<any[]>(url);
    }

    // consultation.service.ts


    // ==================== MÉTHODES ANCIENNES (conservées pour compatibilité) ====================

    /**
     * @deprecated Utiliser validerDossier() à la place
     */
    valider(id: number): Observable<Consultation> {
        return this.validerDossier(id, 'CONSULTATION');
    }

    /**
     * @deprecated Utiliser rejeterDossier() à la place
     */
    rejeter(id: number, motif: string): Observable<Consultation> {
        return this.rejeterDossier(id, 'CONSULTATION', motif);
    }
}
