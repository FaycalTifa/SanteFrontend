// models/taux-couverture.model.ts
export interface TauxCouverture {
    id: number;
    code: string;
    libelle: string;
    tauxPourcentage: number;
}

export interface PoliceTaux {
    id: number;
    numeroPolice: string;
    nomAssure: string;
    prenomAssure: string;
    tauxId: number;
    tauxCode: string;
    tauxLibelle: string;
    tauxPourcentage: number;
    dateDebut: string;
    dateFin?: string;
    actif: boolean;
}

export interface PoliceTauxRequest {
    numeroPolice: string;
    tauxId: number;
    dateDebut: string;
    dateFin?: string;
}
