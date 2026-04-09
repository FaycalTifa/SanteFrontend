// pages/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        // Rediriger si déjà connecté
        if (this.authService.getToken()) {
            const user = this.authService.getCurrentUser();
            if (user) {
                this.redirectByRoles(user.roles);  // ✅ Utiliser roles au lieu de role
            } else {
                this.authService.logout();
            }
        }
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authService.login(this.loginForm.value).subscribe({
            next: (response) => {
                this.loading = false;
                this.redirectByRoles(response.roles);  // ✅ Utiliser roles au lieu de role
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Email ou mot de passe incorrect'
                });
            }
        });
    }

    // ✅ Nouvelle méthode pour gérer plusieurs rôles
    private redirectByRoles(roles: string[]): void {
        if (roles.includes('UAB_ADMIN')) {
            this.router.navigate(['/uab/dashboard']);
        } else if (roles.includes('CAISSIER_HOPITAL')) {
            this.router.navigate(['/caisse-hopital']);
        } else if (roles.includes('MEDECIN')) {
            this.router.navigate(['/medecin/consultations-attente']);
        } else if (roles.includes('PHARMACIEN')) {
            this.router.navigate(['/pharmacie/prescriptions-attente']);
        } else if (roles.includes('BIOLOGISTE')) {
            this.router.navigate(['/laboratoire/examens-attente']);
        } else if (roles.includes('CAISSIER_LABORATOIRE')) {
            this.router.navigate(['/laboratoire/examens-attente']);
        } else {
            this.router.navigate(['/dashboard']);
        }
    }
}
