// models/auth.model.ts
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    type: string;
    id: number;
    email: string;
    nom: string;
    prenom: string;
    roles: string[];        // ✅ Changé de role à roles
    rolesLabels: string[];   // ✅ Ajouté
    structureId: number;
    structureNom: string;

}


