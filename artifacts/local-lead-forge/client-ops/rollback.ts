export interface RollbackPlan{documented:boolean;ownerId?:string|null;restorePoint?:string|null;verificationStep?:string|null;}
export function rollbackReady(x:RollbackPlan):boolean{return x.documented&&Boolean(x.ownerId?.trim())&&Boolean(x.restorePoint?.trim())&&Boolean(x.verificationStep?.trim());}
