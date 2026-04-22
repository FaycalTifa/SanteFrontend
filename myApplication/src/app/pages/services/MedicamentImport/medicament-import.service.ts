// services/medicament/medicament-import.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class MedicamentImportService {
    private baseUrl = 'http://localhost:8080/api';

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

    // ✅ Import des médicaments
    importerMedicamentsCsv(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file, file.name);

        console.log('=== IMPORT CSV MÉDICAMENTS ===');
        console.log('Fichier:', file.name);
        console.log('Taille:', file.size);

        return this.http.post(`${this.baseUrl}/medicaments/import/csv`, formData, {
            headers: this.getHeaders()
        });
    }

    // ✅ Import des examens
    importerExamensCsv(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file, file.name);

        console.log('=== IMPORT CSV EXAMENS ===');
        console.log('Fichier:', file.name);
        console.log('Taille:', file.size);

        return this.http.post(`${this.baseUrl}/medicaments/import/examens/csv`, formData, {
            headers: this.getHeaders()
        });
    }
}
