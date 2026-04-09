// models/laboratoire.model.ts
export interface PaiementLaboratoire {
    prescriptionId: number;
    prixTotal: number;
    montantTicketModerateur: number;
    montantPrisEnCharge: number;
    montantPayePatient: number;
    modePaiement: string;
    referencePaiement?: string;
}
