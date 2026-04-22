// models/soin-dentaire.model.ts
export interface SoinDentaire {
    id: number;
    code: string;
    nom: string;
    categorie: string;
    prixReference: number;
    actif: boolean;
}

export interface PrescriptionSoinDentaire {
    id: number;
    numeroPrescription: string;
    consultationId: number;
    consultationNumeroFeuille: string;
    patientNom: string;
    patientPrenom: string;
    patientPolice: string;
    soinDentaireId?: number;
    soinDentaireNom: string;
    codeActe: string;
    dent: string;           // Numéro de la dent (ex: "11", "12", "21")
    typeSoin: string;       // 'CARIE', 'DEVITALISATION', 'EXTRACTION', 'PROTHESE', 'IMPLANT'
    instructions: string;
    realise: boolean;
    paye: boolean;
    prixTotal: number;
    tauxCouverture: number;
    montantTicketModerateur: number;
    montantPrisEnCharge: number;
    dateRealisation?: string;
    datePaiement?: string;
    dentisteNom?: string;
    laboratoireNom?: string;
}

export interface PrescriptionSoinDentaireDTO {
    soinDentaireId?: number;
    soinDentaireNom: string;
    codeActe: string;
    dent: string;
    typeSoin: string;
    instructions: string;
}
