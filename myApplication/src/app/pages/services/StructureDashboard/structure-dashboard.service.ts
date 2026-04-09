import { Injectable } from '@angular/core';
import {StructureDashboard} from '../../models/StructureDashboard';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StructureDashboardService {

    private baseUrl = 'http://localhost:8080/api/structure/dashboard';

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

    getDashboard(): Observable<StructureDashboard> {
        return this.http.get<StructureDashboard>(this.baseUrl, { headers: this.getHeaders() });
    }
}
