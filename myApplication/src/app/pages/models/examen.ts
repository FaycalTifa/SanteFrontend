// models/examen.model.ts
export interface Examen {
    id: number;
    code: string;
    nom: string;
    validation: string;
    categorie: string;
    prixReference: number;
    actif: boolean;
}
