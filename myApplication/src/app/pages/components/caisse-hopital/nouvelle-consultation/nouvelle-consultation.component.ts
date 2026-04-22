// nouvelle-consultation.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConsultationService } from '../../../services/consultation/consultation.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth/auth.service';
import { TauxCouverture } from '../../../models/TauxCouverture';
import { TauxCouvertureService } from '../../../services/TauxCouverture/taux-couverture.service';
import { AssureService } from '../../../services/assure/assure.service';
import { OracleService } from '../../../services/oracle/oracle.service';

@Component({
    selector: 'app-nouvelle-consultation',
    templateUrl: './nouvelle-consultation.component.html',
    styleUrls: ['./nouvelle-consultation.component.scss']
})
export class NouvelleConsultationComponent implements OnInit {

    consultationForm: FormGroup;
    loading = false;

    tauxDisponibles: TauxCouverture[] = [];
    tauxSelectionne: TauxCouverture | null = null;

    montantPrisEnCharge = 0;
    montantTicketModerateur = 0;
    montantSurplus = 0;

    // Données de la recherche
    policeTrouvee: any = null;
    assurePrincipal: any = null;
    beneficiaires: any[] = [];

    // Plafonnements
    plafonnementsDisponibles: any[] = [];
    plafonnementSelectionne: any = null;
    showPlafondDialog = false;

    // Dialogues
    showResultatDialog = false;

    // Sélection
    beneficiaireSelectionne: any = null;

    rechercheEnCours = false;

    // Filtre
    searchBeneficiaireTerm = '';
    beneficiairesFiltres: any[] = [];

    constructor(
        private fb: FormBuilder,
        private consultationService: ConsultationService,
        private tauxService: TauxCouvertureService,
        private assureService: AssureService,
        private oracleService: OracleService,
        private router: Router,
        private messageService: MessageService
    ) {
        this.consultationForm = this.fb.group({
            numeroPolice: ['', [Validators.required]],
            codeInte: ['', [Validators.required]],
            codeRisq: ['', [Validators.required]],
            codeMemb: ['', ],
            codePres: [''],
            libellePres: [''],
            montantPlafond: [null],
            nomPatient: ['', [Validators.required]],
            prenomPatient: ['', [Validators.required]],
            telephonePatient: [''],
            dateNaissance: [''],
            dateConsultation: [new Date(), [Validators.required]],
            prixConsultation: [0, [Validators.required, Validators.min(0)]],
            prixActes: [0, [Validators.min(0)]],
            tauxId: [null, [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.loadTauxDisponibles();

        // ✅ Ajouter un abonnement pour surveiller les changements du formulaire
        this.consultationForm.statusChanges.subscribe(status => {
            console.log('=== STATUT DU FORMULAIRE ===', status);
            console.log('Formulaire valide:', this.consultationForm.valid);
            console.log('Erreurs du formulaire:', this.getFormValidationErrors());
        });

        this.consultationForm.get('tauxId')?.valueChanges.subscribe(tauxId => {
            this.tauxSelectionne = this.tauxDisponibles.find(t => t.id === tauxId) || null;
            this.calculerMontants();
        });

        this.consultationForm.get('prixConsultation')?.valueChanges.subscribe(() => this.calculerMontants());
        this.consultationForm.get('prixActes')?.valueChanges.subscribe(() => this.calculerMontants());
        this.consultationForm.get('montantPlafond')?.valueChanges.subscribe(() => this.calculerMontants());
    }

    // ✅ Méthode pour afficher les erreurs de validation
    getFormValidationErrors(): any {
        const errors: any = {};
        Object.keys(this.consultationForm.controls).forEach(key => {
            const control = this.consultationForm.get(key);
            if (control?.invalid) {
                errors[key] = control.errors;
            }
        });
        return errors;
    }

    loadTauxDisponibles(): void {
        this.tauxService.getAllTaux().subscribe({
            next: (taux) => {
                this.tauxDisponibles = taux;
            },
            error: (error) => {
                console.error('Erreur chargement taux:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les taux de couverture'
                });
            }
        });
    }

    // ========== RECHERCHE ==========

// nouvelle-consultation.component.ts
    // nouvelle-consultation.component.ts
    // nouvelle-consultation.component.ts
    rechercher(): void {
        // Récupérer les valeurs et les convertir en string
        const codeInteRaw = this.consultationForm.get('codeInte')?.value;
        const numPoliceRaw = this.consultationForm.get('numeroPolice')?.value;
        const codeRisqRaw = this.consultationForm.get('codeRisq')?.value;
        const codeMembRaw = this.consultationForm.get('codeMemb')?.value;

        // Convertir en string et trim (gérer les nombres)
        const codeInte = codeInteRaw ? String(codeInteRaw).trim() : '';
        const numPolice = numPoliceRaw ? String(numPoliceRaw).trim() : '';
        const codeRisq = codeRisqRaw ? String(codeRisqRaw).trim() : '';
        const codeMemb = codeMembRaw ? String(codeMembRaw).trim() : '';

        console.log('=== RECHERCHE ===');
        console.log('codeInte:', codeInte);
        console.log('numPolice:', numPolice);
        console.log('codeRisq:', codeRisq);
        console.log('codeMemb:', codeMemb);

        if (!codeInte || !numPolice || !codeRisq) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez remplir tous les champs de recherche'
            });
            return;
        }

        this.rechercheEnCours = true;

        // ✅ CORRECTION: Passer codeMemb au lieu de null
        // Si codeMemb est vide, passer null ou undefined
        const codeMembToSend = codeMemb && codeMemb !== '' ? codeMemb : null;

        this.oracleService.rechercherComplete(numPolice, codeInte, codeRisq, codeMembToSend).subscribe({
            next: (result) => {
                console.log('Résultat recherche:', result);

                if (!result) {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Aucun résultat',
                        detail: 'Aucune donnée trouvée avec ces critères'
                    });
                    this.rechercheEnCours = false;
                    return;
                }

                this.policeTrouvee = result.police;
                this.assurePrincipal = result.personne;
                this.beneficiaires = result.beneficiaires || [];
                this.beneficiairesFiltres = [...this.beneficiaires];
                this.searchBeneficiaireTerm = '';

                this.showResultatDialog = true;
                this.rechercheEnCours = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Recherche terminée',
                    detail: `${this.beneficiaires.length} bénéficiaire(s) trouvé(s)`
                });
            },
            error: (error) => {
                console.error('Erreur recherche:', error);
                this.rechercheEnCours = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de la recherche'
                });
            }
        });
    }
    // ========== SÉLECTION BÉNÉFICIAIRE ==========

// nouvelle-consultation.component.ts
    selectionnerAssurePrincipal(): void {
        if (this.assurePrincipal) {
            const nom = this.assurePrincipal.LIBERISQ || '';
            let nomValue = nom;
            let prenomValue = '';

            if (nom && nom.includes(' ')) {
                const parts = nom.split(' ');
                prenomValue = parts[0];
                nomValue = parts.slice(1).join(' ');
            }

            // Convertir codeRisq en string
            const codeRisq = this.assurePrincipal.CODERISQ ? String(this.assurePrincipal.CODERISQ) : '';

            this.consultationForm.patchValue({
                nomPatient: nomValue,
                prenomPatient: prenomValue,
                dateNaissance: this.assurePrincipal.DATENAIS ? new Date(this.assurePrincipal.DATENAIS) : null,
                codeRisq
            });

            this.showResultatDialog = false;

            // Charger les plafonnements après sélection
            this.chargerPlafonnements();

            this.messageService.add({
                severity: 'success',
                summary: 'Assuré principal sélectionné',
                detail: nomValue
            });
        }
    }
// nouvelle-consultation.component.ts
    selectionnerBeneficiaire(beneficiaire: any): void {
        const nom = beneficiaire.NOM_MEMB || '';
        let nomValue = nom;
        let prenomValue = '';

        if (nom && nom.includes(' ')) {
            const parts = nom.split(' ');
            prenomValue = parts[0];
            nomValue = parts.slice(1).join(' ');
        }

        // Convertir codeRisq en string
        const codeRisq = beneficiaire.CODERISQ ? String(beneficiaire.CODERISQ) : '';

        this.consultationForm.patchValue({
            nomPatient: nomValue,
            prenomPatient: prenomValue,
            dateNaissance: beneficiaire.DATENAIS ? new Date(beneficiaire.DATENAIS) : null,
            codeRisq
        });

        this.beneficiaireSelectionne = beneficiaire;
        this.showResultatDialog = false;

        // Charger les plafonnements après sélection
        this.chargerPlafonnements();

        this.messageService.add({
            severity: 'success',
            summary: 'Bénéficiaire sélectionné',
            detail: `${prenomValue} ${nomValue}`
        });
    }
    // ========== PLAFONNEMENTS ==========

// nouvelle-consultation.component.ts
    chargerPlafonnements(): void {
        const numPoliceRaw = this.consultationForm.get('numeroPolice')?.value;
        const codeInteRaw = this.consultationForm.get('codeInte')?.value;

        // Convertir en string
        const numPolice = numPoliceRaw ? String(numPoliceRaw).trim() : '';
        const codeInte = codeInteRaw ? String(codeInteRaw).trim() : '';

        console.log('=== CHARGEMENT PLAFONNEMENTS ===');
        console.log('numPolice:', numPolice);
        console.log('codeInte:', codeInte);

        if (numPolice && codeInte) {
            this.oracleService.getPlafonnementsByPolice(numPolice, codeInte).subscribe({
                next: (plafonnements) => {
                    console.log('Plafonnements reçus:', plafonnements);
                    this.plafonnementsDisponibles = plafonnements || [];

                    if (this.plafonnementsDisponibles.length === 1) {
                        this.selectionnerPlafonnement(this.plafonnementsDisponibles[0]);
                    } else if (this.plafonnementsDisponibles.length > 1) {
                        this.showPlafondDialog = true;
                    }
                },
                error: (error) => {
                    console.error('Erreur chargement plafonnements:', error);
                }
            });
        }
    }
// nouvelle-consultation.component.ts
    selectionnerPlafonnement(plafond: any): void {
        console.log('Plafonnement sélectionné:', plafond);

        this.plafonnementSelectionne = plafond;

        // Convertir les valeurs en string si nécessaire
        const codePres = plafond.CODEPRES ? String(plafond.CODEPRES) : '';
        const libellePres = plafond.LIBEPRES ? String(plafond.LIBEPRES) : '';
        const montantPlafond = plafond.VALEPLAF ? Number(plafond.VALEPLAF) : 0;

        this.consultationForm.patchValue({
            codePres,
            libellePres,
            montantPlafond
        });

        this.showPlafondDialog = false;

        // Recalculer les montants
        this.calculerMontants();

        this.messageService.add({
            severity: 'success',
            summary: 'Plafond sélectionné',
            detail: `${libellePres} - ${montantPlafond} FCFA`
        });
    }
    // ========== FILTRES ==========

    filtrerBeneficiaires(): void {
        const searchTerm = this.searchBeneficiaireTerm.toLowerCase().trim();

        if (!searchTerm) {
            this.beneficiairesFiltres = [...this.beneficiaires];
        } else {
            this.beneficiairesFiltres = this.beneficiaires.filter(benef => {
                const nom = (benef.NOM_MEMB || '').toLowerCase();
                return nom.includes(searchTerm);
            });
        }
    }

    resetFiltre(): void {
        this.searchBeneficiaireTerm = '';
        this.beneficiairesFiltres = [...this.beneficiaires];
    }

    // ========== CALCULS ==========

    calculerTotal(): number {
        const prixConsultation = this.consultationForm.get('prixConsultation')?.value || 0;
        const prixActes = this.consultationForm.get('prixActes')?.value || 0;
        return prixConsultation + prixActes;
    }

    calculerMontants(): void {
        const total = this.calculerTotal();
        const montantPlafond = this.consultationForm.get('montantPlafond')?.value || total;
        const taux = this.tauxSelectionne?.tauxPourcentage || 0;

        console.log('=== CALCUL REMBOURSEMENT ===');
        console.log('Total:', total);
        console.log('Montant plafond:', montantPlafond);
        console.log('Taux:', taux);

        const montantRembourseUAB = Math.min(total, montantPlafond) * (taux / 100);
        const ticketModerateur = Math.min(total, montantPlafond) - montantRembourseUAB;
        const surplus = total > montantPlafond ? total - montantPlafond : 0;

        this.montantPrisEnCharge = montantRembourseUAB;
        this.montantTicketModerateur = ticketModerateur + surplus;
        this.montantSurplus = surplus;

        console.log('Remboursement UAB:', this.montantPrisEnCharge);
        console.log('Ticket modérateur + surplus:', this.montantTicketModerateur);
    }

    // ========== FORMULAIRE ==========

// nouvelle-consultation.component.ts
// nouvelle-consultation.component.ts
    onSubmit(): void {
        console.log('=== CRÉATION CONSULTATION ===');

        // 1. Vérifier si le formulaire est valide
        if (this.consultationForm.invalid) {
            // Afficher les champs invalides
            const invalidFields: string[] = [];
            Object.keys(this.consultationForm.controls).forEach(key => {
                const control = this.consultationForm.get(key);
                if (control?.invalid) {
                    invalidFields.push(key);
                    control.markAsTouched();
                }
            });

            this.messageService.add({
                severity: 'error',
                summary: 'Formulaire incomplet',
                detail: `Veuillez remplir correctement les champs suivants: ${invalidFields.join(', ')}`,
                life: 5000
            });
            return;
        }

        // 2. Vérifier si un taux est sélectionné
        if (!this.tauxSelectionne) {
            this.messageService.add({
                severity: 'error',
                summary: 'Taux manquant',
                detail: 'Veuillez sélectionner un taux de couverture',
                life: 4000
            });
            return;
        }

        // 3. Vérifier si un bénéficiaire a été sélectionné
        const nomPatient = this.consultationForm.get('nomPatient')?.value;
        const prenomPatient = this.consultationForm.get('prenomPatient')?.value;

        if (!nomPatient || !prenomPatient) {
            this.messageService.add({
                severity: 'error',
                summary: 'Patient manquant',
                detail: 'Veuillez sélectionner un bénéficiaire ou un assuré principal',
                life: 4000
            });
            return;
        }

        // 4. Vérifier le montant total
        const total = this.calculerTotal();
        if (total <= 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Montant invalide',
                detail: 'Le montant total de la consultation doit être supérieur à 0',
                life: 4000
            });
            return;
        }

        this.loading = true;
        const formValue = this.consultationForm.value;

        // Déterminer le type de consultation
        let typeConsultation = 'GENERALISTE';
        if (this.plafonnementSelectionne) {
            const libelle = this.plafonnementSelectionne.LIBEPRES || '';
            if (libelle.toUpperCase().includes('SPECIALISTE')) {
                typeConsultation = 'SPECIALISTE';
            } else if (libelle.toUpperCase().includes('PROFESSEUR')) {
                typeConsultation = 'PROFESSEUR';
            }
        }

        const request = {
            numeroPolice: formValue.numeroPolice,
            codeInte: formValue.codeInte,
            codeRisq: formValue.codeRisq,
            codePres: formValue.codePres,
            codeMemb: formValue.codeMemb,
            libellePres: formValue.libellePres,
            montantPlafond: formValue.montantPlafond,
            typeConsultation,
            nomPatient: formValue.nomPatient,
            prenomPatient: formValue.prenomPatient,
            telephonePatient: formValue.telephonePatient || '',
            dateNaissance: formValue.dateNaissance ? this.formatDate(formValue.dateNaissance) : '',
            dateConsultation: this.formatDate(formValue.dateConsultation),
            prixConsultation: formValue.prixConsultation,
            prixActes: formValue.prixActes || 0,
            tauxId: formValue.tauxId
        };

        console.log('Requête envoyée:', request);

        this.consultationService.createByCaisse(request).subscribe({
            next: (response) => {
                // ✅ Succès - Message détaillé
                this.messageService.add({
                    severity: 'success',
                    summary: '✅ Consultation créée avec succès',
                    detail: `N° Feuille: ${response.numeroFeuille} | Police: ${response.numeroPolice} | Patient: ${response.prenomPatient} ${response.nomPatient} | Montant total: ${response.montantTotalHospitalier?.toLocaleString()} FCFA | Ticket modérateur: ${response.montantTicketModerateur?.toLocaleString()} FCFA`,
                    life: 8000,
                    sticky: false
                });

                // Notification additionnelle
                this.messageService.add({
                    severity: 'info',
                    summary: 'Prochaines étapes',
                    detail: 'Le patient peut maintenant consulter le médecin pour la prescription',
                    life: 5000
                });

                this.resetForm();
                this.loading = false;

                // Optionnel: Rediriger vers la liste des consultations
                // this.router.navigate(['/caisse-hopital/historique']);
            },
            error: (error) => {
                console.error('Erreur création consultation:', error);
                this.loading = false;

                // ✅ Gestion détaillée des erreurs
                let errorMessage = 'Erreur lors de la création de la consultation';
                let errorTitle = 'Erreur';

                if (error.error?.message) {
                    errorMessage = error.error.message;
                    errorTitle = 'Erreur serveur';
                } else if (error.status === 0) {
                    errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
                    errorTitle = 'Erreur de connexion';
                } else if (error.status === 401) {
                    errorMessage = 'Session expirée. Veuillez vous reconnecter.';
                    errorTitle = 'Non authentifié';
                } else if (error.status === 403) {
                    errorMessage = 'Vous n\'avez pas les droits pour effectuer cette action.';
                    errorTitle = 'Accès refusé';
                } else if (error.status === 404) {
                    errorMessage = 'Service indisponible. Veuillez réessayer plus tard.';
                    errorTitle = 'Service introuvable';
                } else if (error.status === 500) {
                    errorMessage = 'Erreur interne du serveur. Veuillez réessayer ou contacter l\'administrateur.';
                    errorTitle = 'Erreur serveur';
                }

                // Erreur de validation (400)
                if (error.error?.errors) {
                    const validationErrors = error.error.errors;
                    const errorList = Object.values(validationErrors).join(', ');
                    errorMessage = `Données invalides: ${errorList}`;
                    errorTitle = 'Erreur de validation';
                }

                // Police non trouvée
                if (errorMessage.includes('Police non trouvée') || errorMessage.includes('police')) {
                    errorMessage = 'La police saisie n\'existe pas dans la base. Veuillez vérifier le numéro.';
                    errorTitle = 'Police invalide';
                }

                // Taux non trouvé
                if (errorMessage.includes('Taux') || errorMessage.includes('taux')) {
                    errorMessage = 'Le taux de couverture sélectionné n\'est pas valide.';
                    errorTitle = 'Taux invalide';
                }

                this.messageService.add({
                    severity: 'error',
                    summary: `❌ ${errorTitle}`,
                    detail: errorMessage,
                    life: 7000,
                    sticky: error.status === 0 // Reste affiché si erreur de connexion
                });
            }
        });
    }


    // nouvelle-consultation.component.ts - Ajouter cette méthode

    afficherResume(): void {
        const formValue = this.consultationForm.value;
        const total = this.calculerTotal();

        let resumeMessage = `
        📋 RÉSUMÉ DE LA CONSULTATION
        ─────────────────────────
        👤 Patient: ${formValue.prenomPatient} ${formValue.nomPatient}
        🆔 Police: ${formValue.numeroPolice}
        🔑 CODEINTE: ${formValue.codeInte}
        🔢 CODERISQ: ${formValue.codeRisq}
        📅 Date: ${new Date(formValue.dateConsultation).toLocaleDateString()}
        💰 Montant consultation: ${formValue.prixConsultation?.toLocaleString()} FCFA
        💊 Actes médicaux: ${formValue.prixActes?.toLocaleString()} FCFA
        💵 Total: ${total.toLocaleString()} FCFA
        ─────────────────────────
    `;

        if (this.tauxSelectionne) {
            resumeMessage += `
        🏦 Taux de couverture: ${this.tauxSelectionne.tauxPourcentage}%
        ✅ Prise en charge UAB: ${this.montantPrisEnCharge.toLocaleString()} FCFA
        💳 Ticket modérateur patient: ${this.montantTicketModerateur.toLocaleString()} FCFA
        `;
        }

        if (this.plafonnementSelectionne) {
            resumeMessage += `
        📊 Plafond appliqué: ${this.plafonnementSelectionne.LIBEPRES} - ${this.plafonnementSelectionne.VALEPLAF?.toLocaleString()} FCFA
        `;
        }

        this.messageService.add({
            severity: 'info',
            summary: '📋 Récapitulatif de la consultation',
            detail: resumeMessage,
            life: 8000,
            sticky: true
        });
    }
    resetForm(): void {
        this.consultationForm.reset();
        this.consultationForm.patchValue({
            dateConsultation: new Date(),
            prixConsultation: 0,
            prixActes: 0,
            tauxId: null
        });
        this.tauxSelectionne = null;
        this.policeTrouvee = null;
        this.assurePrincipal = null;
        this.beneficiaires = [];
        this.plafonnementsDisponibles = [];
        this.plafonnementSelectionne = null;
        this.beneficiaireSelectionne = null;
        this.montantPrisEnCharge = 0;
        this.montantTicketModerateur = 0;
        this.montantSurplus = 0;
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
