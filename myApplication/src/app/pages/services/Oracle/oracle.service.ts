// services/oracle/oracle.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OracleService {
    private baseUrl = 'http://localhost:8080/api/polices-externes';

    constructor(private http: HttpClient) {}

    /**
     * Recherche complète : police + assuré principal + bénéficiaires
     */
    // services/oracle/oracle.service.ts
    rechercherComplete(numPolice: string, codeInte: string, codeRisq: string, codeMemb?: string): Observable<any> {
        console.log('SERVICE RECHERCHER');
        console.log(numPolice);
        console.log(codeInte);
        console.log(codeRisq);
        console.log(codeMemb);
        let params = new HttpParams()
            .set('numPolice', numPolice)
            .set('codeInte', codeInte)
            .set('codeRisq', codeRisq);

        // ✅ CORRECTION : S'assurer que codeMemb est bien ajouté
        if (codeMemb && codeMemb.trim() !== '') {
            params = params.set('codeMemb', codeMemb);
            console.log('✅ CODEMEMB ajouté à la requête:', codeMemb);
        } else {
            console.log('⚠️ CODEMEMB non fourni ou vide');
        }

        console.log('Appel API recherche complète:', `${this.baseUrl}/recherche-complete?${params.toString()}`);
        return this.http.get<any>(`${this.baseUrl}/recherche-complete`, { params });
    }

    /**
     * Récupérer l'assuré principal
     */
    getAssurePrincipal(numPolice: string, codeInte: string, codeRisq: string): Observable<any> {
        const params = new HttpParams()
            .set('numPolice', numPolice)
            .set('codeInte', codeInte)
            .set('codeRisq', codeRisq);

        return this.http.get<any>(`${this.baseUrl}/assure-principal`, { params });
    }

    /**
     * Récupérer les bénéficiaires
     */
    getBeneficiaires(numPolice: string, codeInte: string, codeRisq: string): Observable<any[]> {
        const params = new HttpParams()
            .set('numPolice', numPolice)
            .set('codeInte', codeInte)
            .set('codeRisq', codeRisq);

        return this.http.get<any[]>(`${this.baseUrl}/beneficiaires`, { params });
    }

    /**
     * Récupérer la liste des CODERISQ disponibles
     */
    getCodeRisqList(numPolice: string, codeInte: string): Observable<any[]> {
        const params = new HttpParams()
            .set('numPolice', numPolice)
            .set('codeInte', codeInte);

        return this.http.get<any[]>(`${this.baseUrl}/code-risq-list`, { params });
    }

    /**
     * Rechercher une police
     */
    searchPolice(numPolice: string, codeInte: string): Observable<any[]> {
        const params = new HttpParams()
            .set('numPolice', numPolice)
            .set('codeInte', codeInte);

        return this.http.get<any[]>(`${this.baseUrl}/search-police`, { params });
    }

    // services/oracle/oracle.service.ts - Ajouter

    // services/oracle/oracle.service.ts
    getPlafonnementsByPolice(numPolice: string, codeInte: string): Observable<any[]> {
        console.log('Appel getPlafonnementsByPolice:', numPolice, codeInte);
        return this.http.get<any[]>(`${this.baseUrl}/${numPolice}/${codeInte}/plafonnements`);
    }

    // services/oracle/oracle.service.ts
    /**
     * Récupérer TOUS les plafonnements d'une police (sans filtre)
     */
    getPlafonnementsAll(numPolice: string, codeInte: string): Observable<any[]> {
        console.log('Appel getPlafonnementsAll:', numPolice, codeInte);
        return this.http.get<any[]>(`${this.baseUrl}/${numPolice}/${codeInte}/plafonnements-all`);
    }

    getPlafonnementByCodePres(numPolice: string, codeInte: string, codePres: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/${numPolice}/${codeInte}/plafonnement/${codePres}`);
    }


}
