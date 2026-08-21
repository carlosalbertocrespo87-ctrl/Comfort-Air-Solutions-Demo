export interface SimulationEvidence { entitlement:boolean; legal:boolean; onboarding:boolean; setup:boolean; qa:boolean; rollback:boolean; auditTrail:boolean; nextActionOwner:boolean; explicitApproval:boolean; }
export function syntheticClientReady(x:SimulationEvidence):boolean {
 return x.entitlement&&x.legal&&x.onboarding&&x.setup&&x.qa&&x.rollback&&x.auditTrail&&x.nextActionOwner&&x.explicitApproval;
}
export function productionActivationAllowed(): boolean { return false; }
