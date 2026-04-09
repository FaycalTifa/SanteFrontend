import {Injectable} from '@angular/core';
import {PrescriptionExamen} from '../../models/prescription';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {Observable} from 'rxjs';
import {Examen} from "../../models/examen";
import {Medicament} from "../../models/medicament";

@Injectable({
    providedIn: 'root'
})
export class MedecinService {

    private baseUrl = 'http://localhost:8080/api';

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

    // ========== MÉDICAMENTS ==========
    searchMedicaments(keyword: string): Observable<Medicament[]> {
        return this.http.get<Medicament[]>(`${this.baseUrl}/medicaments/search?keyword=${keyword}`, {headers: this.getHeaders()});
    }

    getAllMedicaments(): Observable<Medicament[]> {
        return this.http.get<Medicament[]>(`${this.baseUrl}/medicaments`, {headers: this.getHeaders()});
    }

    createMedicament(medicament: Partial<Medicament>): Observable<Medicament> {
        return this.http.post<Medicament>(`${this.baseUrl}/medicaments`, medicament, {headers: this.getHeaders()});
    }

    // ========== EXAMENS ==========
    searchExamens(keyword: string): Observable<Examen[]> {
        return this.http.get<Examen[]>(`${this.baseUrl}/examens/search?keyword=${keyword}`, {headers: this.getHeaders()});
    }

    getAllExamens(): Observable<Examen[]> {
        return this.http.get<Examen[]>(`${this.baseUrl}/examens`, {headers: this.getHeaders()});
    }

    createExamen(examen: Partial<Examen>): Observable<Examen> {
        return this.http.post<Examen>(`${this.baseUrl}/examens`, examen, {headers: this.getHeaders()});
    }
}
