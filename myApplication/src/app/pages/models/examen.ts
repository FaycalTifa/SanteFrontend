// models/examen.model.ts
export interface Examen {
    id: number;
    code: string;
    nom: string;
    categorie: string;
    prixReference: number;
    actif: boolean;
}
