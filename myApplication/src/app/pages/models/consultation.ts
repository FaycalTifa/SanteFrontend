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
    medecinNom: string;
    statut: string;
    validationUab: boolean;
    prescriptionsMedicaments: PrescriptionMedicament[];
    prescriptionsExamens: PrescriptionExamen[];
    prescriptionsValidees: boolean;  // ✅ AJOUTER CE CHAMP
}

export interface ConsultationCaisseRequest {
    numeroPolice: string;
    nomPatient: string;
    prenomPatient: string;
    telephonePatient: string;
    dateNaissance: string;
    dateConsultation: string;
    prixConsultation: number;
    prixActes: number;
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
