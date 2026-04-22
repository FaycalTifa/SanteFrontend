import {Injectable} from '@angular/core';
import {PrescriptionExamen} from '../../models/prescription';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {Observable} from 'rxjs';
import {Examen} from '../../models/examen';
import {Medicament} from '../../models/medicament';

@Injectable({
    providedIn: 'root'
})
export class MedecinService {

    private baseUrl = 'http://localhost:8080/api/medecin';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {
    }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    // medecin.service.ts
    /**
     * Récupérer tous les examens réalisés (pour interprétation)
     */
    getAllExamensRealises(): Observable<PrescriptionExamen[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/medecin/examens-realises`, { headers });
    }

    getDemandesEnAttente(): Observable<PrescriptionExamen[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/medecin/demandes-attente`, { headers });
    }

    // ✅ NOUVELLE MÉTHODE : Récupérer les demandes par consultation
    getDemandesByConsultation(consultationId: number): Observable<PrescriptionExamen[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/medecin/demandes/consultation/${consultationId}`, { headers });
    }

    /**
     * Récupérer les examens réalisés pour une consultation
     * ✅ Vérifier que l'ID est bien passé
     */
    getExamensRealisesByConsultation(consultationId: number): Observable<PrescriptionExamen[]> {
        console.log('getExamensRealisesByConsultation - ID:', consultationId);
        const url = `${this.baseUrl}/consultations/${consultationId}/examens-realises`;
        console.log('URL:', url);
        return this.http.get<PrescriptionExamen[]>(url, {headers: this.getHeaders()});
    }

    /**
     * Récupérer les examens réalisés par numéro de police
     */
    getExamensRealisesByPolice(numeroPolice: string): Observable<PrescriptionExamen[]> {
        console.log('getExamensRealisesByPolice - Police:', numeroPolice);
        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/consultations/medecin/examens/police/${numeroPolice}`, {headers: this.getHeaders()});
    }

    /**
     * Ajouter une interprétation à un examen
     */
    ajouterInterpretation(examenId: number, interpretation: string): Observable<PrescriptionExamen> {
        console.log('ajouterInterpretation - Examen ID:', examenId);
        console.log('Interpretation:', interpretation);
        return this.http.post<PrescriptionExamen>(`${this.baseUrl}/consultations/examens/${examenId}/interpretation`, interpretation, {headers: this.getHeaders()});
    }

    // services/medecin/medecin.service.ts
    /**
     * Récupérer TOUS les examens ayant fait l'objet d'une demande de validation UAB
     * (EN_ATTENTE, OUI validé, NON rejeté)
     * @param numPolice - Numéro de police (optionnel)
     * @param codeInte - CODEINTE (optionnel)
     * @param codeRisq - Code risque (optionnel)
     * @param codeMemb - Code membre (optionnel)
     */
    getDemandesValidation(numPolice?: string, codeInte?: string, codeRisq?: string, codeMemb?: string): Observable<PrescriptionExamen[]> {
        let params = new HttpParams();
        if (numPolice) { params = params.set('numPolice', numPolice); }
        if (codeInte) { params = params.set('codeInte', codeInte); }
        if (codeRisq) { params = params.set('codeRisq', codeRisq); }
        if (codeMemb) { params = params.set('codeMemb', codeMemb); }  // ✅ Ajouter codeMemb

        console.log('Paramètres recherche demandes validation:', { numPolice, codeInte, codeRisq, codeMemb });

        return this.http.get<PrescriptionExamen[]>(`${this.baseUrl}/demandes-validation`, {
            headers: this.getHeaders(),
            params
        });
    }
}
