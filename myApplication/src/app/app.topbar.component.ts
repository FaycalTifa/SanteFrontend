import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {trigger, style, transition, animate, AnimationEvent} from '@angular/animations';
import {ConfirmationService, MessageService} from 'primeng/api';
import {AppComponent} from './app.component';
import {AppMainComponent} from './app.main.component';
import {HttpResponse} from '@angular/common/http';
import isOnline from 'is-online';
import {Router} from '@angular/router';
import {AuthService} from './pages/services/auth/auth.service';
import {Subscription} from 'rxjs';
import {LoginResponse} from './pages/models/auth';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss'],
    animations: [
        trigger('topbarActionPanelAnimation', [
            transition(':enter', [
                style({opacity: 0, transform: 'translateY(-10px) scaleY(0.95)'}),
                animate('200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    style({opacity: 1, transform: 'translateY(0) scaleY(1)'})),
            ]),
            transition(':leave', [
                animate('150ms cubic-bezier(0.4, 0, 0.2, 1)',
                    style({opacity: 0, transform: 'translateY(-10px) scaleY(0.95)'}))
            ])
        ])
    ]
})
export class AppTopBarComponent implements OnInit, OnDestroy {
    currentUser: LoginResponse | null = null;
    notifications: any[] = [];
    notificationsCount = 0;
    displayLogoutDialog = false;
    mobileMenuActive = false;
    activeNotificationsPanel = false;
    isOnline = true;
    private userSubscription: Subscription | null = null;

    constructor(
        public confirmationService: ConfirmationService,
        public appMain: AppMainComponent,
        public app: AppComponent,
        public messageService: MessageService,
        private authService: AuthService,
        private router: Router
    ) {
        this.userSubscription = this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.loadNotifications();
        this.checkConnection();
    }

    ngOnDestroy(): void {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        // Fermer le panneau de notifications quand on clique ailleurs
        const target = event.target as HTMLElement;
        if (this.activeNotificationsPanel && !target.closest('.notifications-item')) {
            this.activeNotificationsPanel = false;
        }
    }

    toggleMobileMenu(): void {
        this.mobileMenuActive = !this.mobileMenuActive;
        if (this.mobileMenuActive) {
            this.activeNotificationsPanel = false;
        }
    }

    toggleNotifications(event: Event): void {
        event.stopPropagation();
        this.activeNotificationsPanel = !this.activeNotificationsPanel;
        if (this.activeNotificationsPanel) {
            this.mobileMenuActive = false;
        }
    }

    loadNotifications(): void {
        // À remplacer par votre service de notifications
        this.notifications = [
            {
                title: 'Évaluation à faire',
                message: 'Vous avez une évaluation en attente',
                date: new Date(),
                read: false
            },
            {
                title: 'Évaluation validée',
                message: 'L\'évaluation de KONE Moussa a été validée',
                date: new Date(),
                read: false
            }
        ];
        this.notificationsCount = this.notifications.filter(n => !n.read).length;
    }

    getRoleLabel(role: string): string {
        const roles: {[key: string]: string} = {
            CAISSIER_HOPITAL: 'Caissier Hôpital',
            MEDECIN: 'Médecin',
            PHARMACIEN: 'Pharmacien',
            BIOLOGISTE: 'Biologiste',
            UAB_ADMIN: 'Administrateur UAB'
        };
        return roles[role] || role;
    }

    async checkConnection(): Promise<void> {
        this.isOnline = navigator.onLine;

        window.addEventListener('online', () => {
            this.isOnline = true;
            this.messageService.add({
                severity: 'success',
                summary: 'Connexion rétablie',
                detail: 'Votre connexion internet est de retour'
            });
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.messageService.add({
                severity: 'warn',
                summary: 'Connexion perdue',
                detail: 'Vérifiez votre connexion internet'
            });
        });
    }

    onLogout(): void {
        this.displayLogoutDialog = true;
        this.mobileMenuActive = false;
    }

    confirmLogout(): void {
        this.displayLogoutDialog = false;
        this.authService.logout();
    }
}
