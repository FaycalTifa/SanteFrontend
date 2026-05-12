// admin-validation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminValidationService {
    private baseUrl = 'http://localhost:8080/api/admin/validations';

    constructor(private http: HttpClient, private authService: AuthService) {}

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    // ✅ Médicaments – accepte une string "OUI" ou "NON"
    getMedicamentsEnAttente(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/medicaments/pending`, { headers: this.getHeaders() });
    }

    validerMedicament(id: number, exclusion: string): Observable<any> {
        const params = new HttpParams().set('exclusion', exclusion);  // envoie "OUI" ou "NON"
        return this.http.put(`${this.baseUrl}/medicaments/${id}/valider`, null, { headers: this.getHeaders(), params });
    }

    // ✅ Examens – accepte une string "OUI" ou "NON"
    getExamensEnAttente(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/examens/pending`, { headers: this.getHeaders() });
    }

    validerExamen(id: number, validation: string): Observable<any> {
        const params = new HttpParams().set('validationUab', validation);  // envoie "OUI" ou "NON"
        return this.http.put(`${this.baseUrl}/examens/${id}/valider`, null, { headers: this.getHeaders(), params });
    }
}
