export interface Utilisateur {
    id: number;
    structureId: number;
    structureNom: string;
    nom: string;
    prenom: string;
    email: string;
    roles: string[];  // ✅ Liste des codes de rôles
    rolesLabels: string[];  // ✅ Liste des libellés
    telephone: string;
    actif: boolean;
    dernierAcces: string;
    createdAt: string;
}

export interface UtilisateurRequest {
    structureId?: number;
    nom: string;
    prenom: string;
    email: string;
    password: string;
    roles: string[];  // ✅ Liste des codes de rôles
    telephone?: string;
}

export interface Role {
    code: string;
    nom: string;
}
export interface Utilisateur {
    id: number;
    structureId: number;
    structureNom: string;
    nom: string;
    prenom: string;
    email: string;
    roles: string[];  // ✅ Liste des codes de rôles
    rolesLabels: string[];  // ✅ Liste des libellés
    telephone: string;
    actif: boolean;
    dernierAcces: string;
    createdAt: string;
}

export interface UtilisateurRequest {
    structureId?: number;
    nom: string;
    prenom: string;
    email: string;
    password: string;
    roles: string[];  // ✅ Liste des codes de rôles
    telephone?: string;
}

export interface Role {
    code: string;
    nom: string;
}
