import { Injectable } from '@angular/core';
import {Medicament} from '../../models/medicament';
import {ApiService} from '../api/api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicamentService {

    private endpoint = 'http://localhost:8080/api/medicaments';

    constructor(private api: ApiService) {}

    search(keyword: string): Observable<Medicament[]> {
        return this.api.get(`${this.endpoint}/search`, { keyword });
    }

    getAll(): Observable<Medicament[]> {
        return this.api.get(this.endpoint);
    }

    getById(id: number): Observable<Medicament> {
        return this.api.get(`${this.endpoint}/${id}`);
    }

    create(medicament: { forme: string; dosage: string; actif: boolean; nom: string }): Observable<Medicament> {
        return this.api.post(this.endpoint, medicament);
    }

    update(id: number, medicament: Medicament): Observable<Medicament> {
        return this.api.put(`${this.endpoint}/${id}`, medicament);
    }

    delete(id: number): Observable<void> {
        return this.api.delete(`${this.endpoint}/${id}`);
    }
}
