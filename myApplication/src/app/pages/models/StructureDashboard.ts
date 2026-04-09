export interface StructureDashboard {
    structureId: number;
    structureNom: string;
    structureType: string;
    statsGenerales: StatsGenerales;
    evolutionMensuelle: EvolutionMensuelle[];
    detailParAnnee: { [key: number]: AnneeDetail };
    dernieresActivites: ActiviteRecente[];
}

export interface StatsGenerales {
    totalDossiers: number;
    enAttente: number;
    valides: number;
    rejetes: number;
    montantTotalPrisEnCharge: number;
    montantTotalRembourse: number;
    totalPatients: number;
    montantMoyenParDossier: number;
}

export interface EvolutionMensuelle {
    mois: string;
    annee: number;
    nombreDossiers: number;
    montantTotal: number;
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

export interface ActiviteRecente {
    id: number;
    type: string;
    description: string;
    montant: number;
    date: string;
    statut: string;
}
