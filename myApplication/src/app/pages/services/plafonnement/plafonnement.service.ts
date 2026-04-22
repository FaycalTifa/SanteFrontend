import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Plafonnement} from '../../models/Plafonnement';
import {CalculRemboursement} from '../../models/CalculRemboursement';

@Injectable({
    providedIn: 'root'
})
export class PlafonnementService {

    private baseUrl = 'http://localhost:8080/api/plafonnement';

    constructor(private http: HttpClient) {
    }

    /**
     * Récupérer tous les plafonnements
     */
    getAll(): Observable<Plafonnement[]> {
        return this.http.get<Plafonnement[]>(`${this.baseUrl}`);
    }

    /**
     * Récupérer les plafonnements d'un CODEINTE
     */
    getByCodeInte(codeInte: string): Observable<Plafonnement[]> {
        return this.http.get<Plafonnement[]>(`${this.baseUrl}/${codeInte}`);
    }

    /**
     * Récupérer un plafonnement spécifique
     */
    getByCodeInteAndType(codeInte: string, typeConsultation: string): Observable<Plafonnement> {
        return this.http.get<Plafonnement>(`${this.baseUrl}/${codeInte}/${typeConsultation}`);
    }

    /**
     * Créer un plafonnement
     */
    create(plafonnement: Plafonnement): Observable<Plafonnement> {
        return this.http.post<Plafonnement>(`${this.baseUrl}`, plafonnement);
    }

    /**
     * Modifier un plafonnement
     */
    update(id: number, plafonnement: Plafonnement): Observable<Plafonnement> {
        return this.http.put<Plafonnement>(`${this.baseUrl}/${id}`, plafonnement);
    }

    /**
     * Supprimer un plafonnement
     */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    /**
     * Calculer le remboursement avec plafonnement
     */
    calculerRemboursement(codeInte: string, typeConsultation: string, montant: number, tauxCouverture: number): Observable<CalculRemboursement> {
        const params = new HttpParams()
            .set('codeInte', codeInte)
            .set('typeConsultation', typeConsultation)
            .set('montant', montant.toString())
            .set('tauxCouverture', tauxCouverture.toString());

        return this.http.get<CalculRemboursement>(`${this.baseUrl}/calculer`, {params});
    }
}
