export interface DashboardStats {
    totalDossiers: number;
    enAttente: number;
    valides: number;
    rejetes: number;
    montantTotalPrisEnCharge: number;
    montantTotalRembourse: number;
    // ✅ AJOUTER CES PROPRIÉTÉS
    structures: StructureStats[];
    detailParStructure: { [key: string]: StructureDetail };
}

export interface StructureStats {
    structureId: number;
    structureNom: string;
    structureType: string;
    totalDossiers: number;
    enAttente: number;
    valides: number;
    rejetes: number;
    montantTotal: number;
    annees: YearStats[];
}

export interface YearStats {
    annee: number;
    totalDossiers: number;
    montantTotal: number;
    mois: MonthStats[];
}

export interface MonthStats {
    mois: number;
    nomMois: string;
    totalDossiers: number;
    montantTotal: number;
}

export interface StructureDetail {
    nom: string;
    type: string;
    annees: { [key: number]: AnneeDetail };
}

export interface AnneeDetail {
    annee: number;
    totalDossiers: number;
    montantTotal: number;
    mois: { [key: number]: MoisDetail };
}

export interface MoisDetail {
    mois: number;
    nomMois: string;
    totalDossiers: number;
    montantTotal: number;
    consultations: ConsultationSimple[];
}

export interface ConsultationSimple {
    id: number;
    numeroFeuille: string;
    patientNom: string;
    patientPrenom: string;
    numeroPolice: string;
    dateConsultation: string;
    montant: number;
    statut: string;
}
