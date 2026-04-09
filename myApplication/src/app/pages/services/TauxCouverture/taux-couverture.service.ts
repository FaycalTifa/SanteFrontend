import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {PoliceTaux, PoliceTauxRequest, TauxCouverture} from '../../models/TauxCouverture';
import {ApiService} from '../api/api.service';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TauxCouvertureService {

    private baseUrl = 'http://localhost:8080/api';

    constructor(private http: HttpClient) {}

    // Taux de couverture
    // Récupérer tous les taux actifs
    getAllTaux(): Observable<TauxCouverture[]> {
        return this.http.get<TauxCouverture[]>(`${this.baseUrl}/taux-couverture`);
    }

    // Récupérer un taux par ID
    getTauxById(id: number): Observable<TauxCouverture> {
        return this.http.get<TauxCouverture>(`${this.baseUrl}/taux-couverture/${id}`);
    }

    // Créer un nouveau taux
    createTaux(taux: TauxCouverture): Observable<TauxCouverture> {
        return this.http.post<TauxCouverture>(`${this.baseUrl}/taux-couverture`, taux);
    }

    // Modifier un taux
    updateTaux(id: number, taux: TauxCouverture): Observable<TauxCouverture> {
        return this.http.put<TauxCouverture>(`${this.baseUrl}/taux-couverture/${id}`, taux);
    }

    // Désactiver un taux
    desactiverTaux(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/taux-couverture/${id}`);
    }

    // Activer un taux
    activerTaux(id: number): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/taux-couverture/${id}/activer`, {});
    }

    // ========== ASSOCIATION POLICE - TAUX ==========

    // Récupérer le taux actif d'une police
    getTauxActifByPolice(numeroPolice: string): Observable<PoliceTaux> {
        return this.http.get<PoliceTaux>(`${this.baseUrl}/polices-taux/actif/${numeroPolice}`);
    }

    // Récupérer l'historique des taux d'une police
    getHistoriqueTauxPolice(numeroPolice: string): Observable<PoliceTaux[]> {
        return this.http.get<PoliceTaux[]>(`${this.baseUrl}/polices-taux/historique/${numeroPolice}`);
    }

    // Assigner un taux à une police
    assignerTaux(request: PoliceTauxRequest): Observable<PoliceTaux> {
        return this.http.post<PoliceTaux>(`${this.baseUrl}/polices-taux`, request);
    }
}
