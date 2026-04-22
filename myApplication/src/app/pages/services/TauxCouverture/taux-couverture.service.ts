import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {PoliceTaux, PoliceTauxRequest, TauxCouverture} from '../../models/TauxCouverture';
import {ApiService} from '../api/api.service';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TauxCouvertureService {

    private baseUrl = 'http://localhost:8080/api/taux-couverture';

    constructor(private http: HttpClient) {}

    // Récupérer tous les taux
    getAllTaux(): Observable<TauxCouverture[]> {
        return this.http.get<TauxCouverture[]>(`${this.baseUrl}`);
    }

    // Récupérer un taux par ID
    getTauxById(id: number): Observable<TauxCouverture> {
        return this.http.get<TauxCouverture>(`${this.baseUrl}/${id}`);
    }

    // Créer un nouveau taux
    createTaux(taux: TauxCouverture): Observable<TauxCouverture> {
        return this.http.post<TauxCouverture>(`${this.baseUrl}`, taux);
    }

    // Modifier un taux
    updateTaux(id: number, taux: TauxCouverture): Observable<TauxCouverture> {
        return this.http.put<TauxCouverture>(`${this.baseUrl}/${id}`, taux);
    }

    // Supprimer un taux
    deleteTaux(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
    
    }
