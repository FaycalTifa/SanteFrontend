// app-routing.module.ts - Version corrigée
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppMainComponent } from './app.main.component';

// Composants
import { ConsultationsAttenteComponent } from './pages/components/medecin/consultations-attente/consultations-attente.component';
import { PrescriptionsComponent } from './pages/components/medecin/prescriptions/prescriptions.component';
import { InterpretationResultatsComponent } from './pages/components/medecin/interpretation-resultats/interpretation-resultats.component';
import { NouvelleConsultationComponent } from './pages/components/caisse-hopital/nouvelle-consultation/nouvelle-consultation.component';
import { PrescriptionsAttenteComponent } from './pages/components/pharmacie/prescriptions-attente/prescriptions-attente.component';
import { DelivranceComponent } from './pages/components/pharmacie/delivrance/delivrance.component';
import { ExamensAttenteComponent } from './pages/components/laboratoire/examens-attente/examens-attente.component';
import { RealisationComponent } from './pages/components/laboratoire/realisation/realisation.component';
import { CaisseLaboratoireComponent } from './pages/components/laboratoire/caisse-laboratoire/caisse-laboratoire.component';
import { DashboardComponent } from './pages/components/uab/dashboard/dashboard.component';
import { DossiersComponent } from './pages/components/uab/dossiers/dossiers.component';
import { ValidationComponent } from './pages/components/uab/validation/validation.component';
import { MedicamentsComponent } from './pages/components/parametres/medicaments/medicaments.component';
import { ExamensComponent } from './pages/components/parametres/examens/examens.component';
import { TauxCouvertureComponent } from './pages/components/parametres/taux-couverture/taux-couverture.component';
import { LoginComponent } from './pages/components/login/login.component';
import { RoleGuard } from './pages/core/RoleGuard/role.guard';
import { GuardsGuard } from './pages/core/guards/guards.guard';
import { StructureDashboardComponent } from './pages/components/structure-dashboard/structure-dashboard.component';
import { UtilisateursComponent } from './pages/components/uab/utilisateurs/utilisateurs.component';
import { StructuresComponent } from "./pages/components/structures/structures.component";
import {PlafonnementComponent} from "./pages/components/uab/plafonnement/plafonnement.component";
import {ImportMedicamentsComponent} from "./pages/components/uab/import-medicaments/import-medicaments.component";
import {DemandesAttenteComponent} from "./pages/components/medecin/demandes-attente/demandes-attente.component";
import {ValidationExamensComponent} from "./pages/components/uab/validation-examens/validation-examens.component";

@NgModule({
    imports: [
        RouterModule.forRoot([
            // ✅ Route Login en dehors du layout (pas de menu)
            { path: 'login', component: LoginComponent },

            // ✅ Routes avec layout (avec menu)
            {
                path: '', component: AppMainComponent,
                children: [
                    // Redirection par défaut après login
                    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

                    // Caisse Hôpital
                    {
                        path: 'caisse-hopital',
                        component: NouvelleConsultationComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['CAISSIER_HOPITAL'] }
                    },
                    {
                        path: 'caisse-hopital/historique',
                        component: NouvelleConsultationComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['CAISSIER_HOPITAL'] }
                    },

                    // Médecin
                    {
                        path: 'medecin/consultations-attente',
                        component: ConsultationsAttenteComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['MEDECIN'] }
                    },
                    {
                        path: 'medecin/prescriptions/:id',
                        component: PrescriptionsComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['MEDECIN'] }
                    },
                    {
                        path: 'medecin/mes-consultations',
                        component: ConsultationsAttenteComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['MEDECIN'] }
                    },
                    {
                        path: 'medecin/interpretations',
                        component: InterpretationResultatsComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['MEDECIN'] }
                    },
                    // app-routing.module.ts
                    {
                        path: 'medecin/demandes-attente',
                        component: DemandesAttenteComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['MEDECIN'] }
                    },
                    {
                        path: 'medecin/interpretation/:id',
                        component: InterpretationResultatsComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['MEDECIN'] }
                    },

                    // Pharmacie
                    {
                        path: 'pharmacie/prescriptions-attente',
                        component: PrescriptionsAttenteComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['PHARMACIEN', 'CAISSIER_PHARMACIE'] }
                    },
                    {
                        path: 'pharmacie/delivrance/:id',
                        component: DelivranceComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['PHARMACIEN'] }
                    },
                    {
                        path: 'pharmacie/historique',
                        component: PrescriptionsAttenteComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['PHARMACIEN', 'CAISSIER_PHARMACIE'] }
                    },

                    // Laboratoire
                    {
                        path: 'laboratoire/examens-attente',
                        component: ExamensAttenteComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['BIOLOGISTE', 'CAISSIER_LABORATOIRE'] }
                    },
                    {
                        path: 'laboratoire/caisse/:id',
                        component: CaisseLaboratoireComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['CAISSIER_LABORATOIRE'] }
                    },
                    {
                        path: 'laboratoire/realisation/:id',
                        component: RealisationComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['BIOLOGISTE'] }
                    },
                    {
                        path: 'laboratoire/historique',
                        component: ExamensAttenteComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['BIOLOGISTE', 'CAISSIER_LABORATOIRE'] }
                    },

                    // UAB
                    {
                        path: 'uab/dashboard',
                        component: DashboardComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['UAB_ADMIN'] }
                    },
                    {
                        path: 'uab/dossiers',
                        component: DossiersComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['UAB_ADMIN'] }
                    },
                    // app-routing.module.ts
                    {
                        path: 'uab/parametres/import-medicaments',
                        component: ImportMedicamentsComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['UAB_ADMIN'] }
                    },
                    {
                        path: 'uab/validation/:id',
                        component: ValidationComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['UAB_ADMIN'] }
                    },
                    // app-routing.module.ts
                    {
                        path: 'uab/validation/:id/:type',
                        component: ValidationComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['UAB_ADMIN'] }
                    },
                    {
                        path: 'uab/parametres/medicaments',
                        component: MedicamentsComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['UAB_ADMIN'] }
                    },
                    {
                        path: 'uab/parametres/examens',
                        component: ExamensComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['UAB_ADMIN'] }
                    },
                    {
                        path: 'uab/parametres/taux-couverture',
                        component: TauxCouvertureComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['UAB_ADMIN'] }
                    },
                    {
                        path: 'uab/Validation/examen',
                        component: ValidationExamensComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['UAB_ADMIN'] }
                    },
                    {
                        path: 'caisse-hopital/plafonnements',
                        component: PlafonnementComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['CAISSIER_HOPITAL'] }
                    },
                    {
                        path: 'uab/parametres/utilisateurs',
                        component: UtilisateursComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['UAB_ADMIN'] }
                    },
                    {
                        path: 'uab/parametres/structures',
                        component: StructuresComponent,
                        canActivate: [GuardsGuard, RoleGuard],
                        data: { roles: ['UAB_ADMIN'] }
                    },

                    // Dashboard Structure (pour tous les rôles ayant une structure)
                    {
                        path: 'dashboard',
                        component: StructureDashboardComponent,
                        canActivate: [GuardsGuard],
                        data: { roles: ['CAISSIER_HOPITAL', 'MEDECIN', 'PHARMACIEN', 'BIOLOGISTE', 'CAISSIER_PHARMACIE', 'CAISSIER_LABORATOIRE'] }
                    },
                ]
            },

            // Redirection si route non trouvée
            { path: '**', redirectTo: '/login' },
        ], { scrollPositionRestoration: 'enabled' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
