// models/prescription.model.ts
export interface PrescriptionMedicament {
    id: number;
    consultationId: number;
    numeroOrdonnance: string;
    medicamentId: number;
    medicamentNom: string;
    medicamentDosage: string;
    medicamentForme: string;
    quantitePrescitee: number;
    quantiteDelivree: number;
    instructions: string;
    delivre: boolean;
    prixUnitaire: number;
    prixTotal: number;
    montantTicketModerateur: number;
    montantPrisEnCharge: number;
    dateDelivrance: string;
    // ✅ Ajouter ces propriétés pour accéder directement aux infos patient
    patientNom?: string;
    patientPrenom?: string;
    patientPolice?: string;
    tauxCouverture?: number;
    pharmacieNom: string; consultation?: {           // ✅ AJOUTER L'OBJET CONSULTATION COMPLET
        id: number;
        numeroFeuille: string;
        numeroPolice: string;
        nomPatient: string;
        prenomPatient: string;
        dateConsultation: string;
        montantTotalHospitalier: number;
        montantTicketModerateur: number;
    };

}

export interface PrescriptionExamen {
    id: number;
    numeroBulletin: string;
    consultationId: number;
    consultationNumeroFeuille: string;
    patientNom: string;
    patientPrenom: string;
    patientPolice: string;
    codeInte?: string;      // ✅ AJOUTER - CODEINTE
    codeRisq?: string;      // ✅ AJOUTER - CODERISQ
    datePaiement?: string;
    examenId?: number;
    validationUab: string;
    motifRejet?: string;
    examenNom: string;
    examenCategorie?: string;
    codeActe: string;
    instructions: string;
    realise: boolean;
    prixTotal: number;
    tauxCouverture: number;  // ← AJOUTER cette propriété
    montantTicketModerateur: number;
    montantPrisEnCharge: number;
    dateRealisation: string;
    laboratoireId?: number;
    laboratoireNom: string;
    biologisteId?: number;
    biologisteNom: string;
    resultats: ResultatExamen[];
    interpretation: string;
    paye: boolean;           // ✅ Ajouter cette propriété
    datePrescription?: string;
    medecinNom?: string;
}

export interface ResultatExamen {
    id: number;
    parametre: string;
    valeur: string;
    unite: string;
    valeurNormaleMin: string;
    valeurNormaleMax: string;
    anormal: boolean;
}

export interface PharmacieDelivranceRequest {
    prescriptionId: number;
    prixUnitaire: number;
    quantiteDelivree: number;
}

export interface LaboratoireRealisationRequest {
    prescriptionId: number;
    prixTotal: number;
    resultats: ResultatExamenDTO[];
}

export interface ResultatExamenDTO {
    parametre: string;
    valeur: string;
    unite: string;
    valeurNormaleMin: string;
    valeurNormaleMax: string;
}

export interface PrescriptionExamen {
    id: number;
    numeroBulletin: string;
    consultationId: number;
    consultationNumeroFeuille: string;
    patientNom: string;
    patientPrenom: string;
    patientPolice: string;
    examenNom: string;
    codeActe: string;
    instructions: string;
    realise: boolean;
    prixTotal: number;
    montantTicketModerateur: number;
    montantPrisEnCharge: number;
    dateRealisation: string;
    laboratoireNom: string;
    biologisteNom: string;
    resultats: ResultatExamen[];
    interpretation: string;
}

export interface ResultatExamen {
    id: number;
    parametre: string;
    valeur: string;
    unite: string;
    valeurNormaleMin: string;
    valeurNormaleMax: string;
    anormal: boolean;
}

export interface LaboratoireRealisationRequest {
    prescriptionId: number;
    prixTotal: number;
    resultats: ResultatExamenRequest[];
}

export interface ResultatExamenRequest {
    parametre: string;
    valeur: string;
    unite: string;
    valeurNormaleMin: string;
    valeurNormaleMax: string;
}

