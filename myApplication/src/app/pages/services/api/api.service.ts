import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) {}

    get<T>(endpoint: string, params?: any): Observable<T> {
        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    httpParams = httpParams.set(key, params[key]);
                }
            });
        }
        return this.http.get<T>(endpoint, { params: httpParams });
    }

    post<T>(endpoint: string, data: any): Observable<T> {
        return this.http.post<T>(endpoint, data);
    }

    put<T>(endpoint: string, data: any): Observable<T> {
        return this.http.put<T>(endpoint, data);
    }

    patch<T>(endpoint: string, data: any): Observable<T> {
        return this.http.patch<T>(endpoint, data);
    }

    delete<T>(endpoint: string): Observable<T> {
        return this.http.delete<T>(endpoint);
    }
}
