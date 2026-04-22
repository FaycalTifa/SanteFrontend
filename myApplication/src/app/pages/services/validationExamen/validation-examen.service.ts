// services/uab/validation-examen.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class ValidationExamenService {
    private baseUrl = 'http://localhost:8080/api/uab/examens';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    getExamensEnAttenteValidation(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/attente-validation`, { headers: this.getHeaders() });
    }

    validerExamen(id: number): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}/valider`, {}, { headers: this.getHeaders() });
    }

    rejeterExamen(id: number, motif: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}/rejeter?motif=${motif}`, {}, { headers: this.getHeaders() });
    }
}
