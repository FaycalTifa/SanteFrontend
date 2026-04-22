// models/consultation.model.ts


import {PrescriptionExamen, PrescriptionMedicament} from "./prescription";

export interface Consultation {
    id: number;
    numeroFeuille: string;
    numeroPolice: string;
    nomPatient: string;
    prenomPatient: string;
    telephonePatient: string;
    dateNaissance: string;
    dateConsultation: string;
    prixConsultation: number;
    prixActes: number;
    montantTotalHospitalier: number;
    tauxCouverture: number;
    montantPrisEnCharge: number;
    montantTicketModerateur: number;
    montantPayePatient: number;
    natureMaladie: string;
    diagnostic: string;
    actesMedicaux: string;
    medecinNom: string;          // ✅ Déjà présent
    structureNom: string;         // ✅ AJOUTER CETTE LIGNE
    structureId?: number;         // ✅ AJOUTER CETTE LIGNE (optionnel)
    medecinId?: number;           // ✅ AJOUTER CETTE LIGNE (optionnel)
    codeInte: string;      // ← AJOUTER
    codeRisq: string;      // ← AJOUTER
    typeConsultation: string; // ← AJOUTER
    statut: string;
    validationUab: boolean;
    prescriptionsMedicaments: PrescriptionMedicament[];
    prescriptionsExamens: PrescriptionExamen[];
    prescriptionsValidees: boolean;  // ✅ AJOUTER CE CHAMP
}

// models/consultation.ts
export interface ConsultationCaisseRequest {
    numeroPolice: string;
    codeInte: string;
    codeRisq: string;
    typeConsultation: string;  // ← Doit exister
    codePres?: string;
    codeMemb?: string;
    libellePres?: string;
    montantPlafond?: number;
    nomPatient: string;
    prenomPatient: string;
    telephonePatient: string;
    dateNaissance: string;
    dateConsultation: string;
    prixConsultation: number;
    prixActes: number;
    tauxId: number;
}

export interface ConsultationPrescriptionRequest {
    natureMaladie: string;
    diagnostic: string;
    actesMedicaux: string;
    prescriptionsMedicaments: PrescriptionMedicamentDTO[];
    prescriptionsExamens: PrescriptionExamenDTO[];
}

export interface PrescriptionMedicamentDTO {
    medicamentId?: number;
    medicamentNom: string;
    dosage: string;
    forme: string;
    quantitePrescitee: number;
    instructions: string;
}

export interface PrescriptionExamenDTO {
    examenId?: number;
    examenNom: string;
    codeActe: string;
    instructions: string;
}
