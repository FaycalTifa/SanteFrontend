export interface Plafonnement {
    id?: number;
    codeInte: string;
    typeConsultation: string;
    montantPlafond: number;
    tauxRemboursement: number;
    actif?: boolean;
    createdAt?: string;
}
