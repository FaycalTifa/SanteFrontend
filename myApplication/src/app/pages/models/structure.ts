// models/structure.model.ts
export interface Structure {
    id: number;
    type: string;
    typeLabel: string;
    nom: string;
    codeStructure: string;
    adresse: string;
    telephone: string;
    email: string;
    agrement: string;
    compteBancaire: string;
    actif: boolean;
    createdAt: string;
    structureId: number;
}

export interface StructureRequest {
    type: string;
    nom: string;
    codeStructure: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    agrement?: string;
    compteBancaire?: string;
}

export interface StructureType {
    code: string;
    label: string;
}

