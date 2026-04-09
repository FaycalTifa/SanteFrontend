import { Injectable } from '@angular/core';
import {Structure, StructureRequest, StructureType} from '../../models/structure';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StructureService {

    private baseUrl = 'http://localhost:8080/api/structures';

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

    getAllStructures(): Observable<Structure[]> {
        return this.http.get<Structure[]>(this.baseUrl, { headers: this.getHeaders() });
    }

    getStructureById(id: number): Observable<Structure> {
        return this.http.get<Structure>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
    }

    createStructure(request: StructureRequest): Observable<Structure> {
        return this.http.post<Structure>(this.baseUrl, request, { headers: this.getHeaders() });
    }

    updateStructure(id: number, request: StructureRequest): Observable<Structure> {
        return this.http.put<Structure>(`${this.baseUrl}/${id}`, request, { headers: this.getHeaders() });
    }

    desactiverStructure(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
    }

    activerStructure(id: number): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${id}/activer`, {}, { headers: this.getHeaders() });
    }

    getStructureTypes(): Observable<StructureType[]> {
        return this.http.get<StructureType[]>(`${this.baseUrl}/types`, { headers: this.getHeaders() });
    }
}
