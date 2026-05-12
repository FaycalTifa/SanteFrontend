// dashboard-refresh.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardRefreshService {
    private refreshSubject = new Subject<void>();


    refresh$ = this.refreshSubject.asObservable();

    notifyRefresh(): void {
        console.log('🔄 Dashboard refresh demandé');
        this.refreshSubject.next();
    }
}
