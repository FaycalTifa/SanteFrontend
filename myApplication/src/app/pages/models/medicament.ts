// models/medicament.model.ts
export interface Medicament {
    id: number;
    code: string;
    nom: string;
    dosage: string;
    forme: string;
    prixReference: number;
    exclusion: string;  // 'OUI' ou 'NON'
    actif: boolean;
}
