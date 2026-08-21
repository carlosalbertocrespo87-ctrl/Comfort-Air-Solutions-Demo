export type ObjectionType='PRICE'|'TRUST'|'TIMING'|'NEED'|'AUTHORITY'|'COMPETITOR'|'UNKNOWN';
export interface ObjectionRecord{type:ObjectionType;ownerId?:string|null;responsePrepared:boolean;evidenceBacked:boolean;nextAction?:string|null;dueAt?:string|null;}
export function objectionReady(x:ObjectionRecord):boolean{return x.type!=='UNKNOWN'&&Boolean(x.ownerId?.trim())&&x.responsePrepared&&x.evidenceBacked&&Boolean(x.nextAction?.trim())&&Boolean(x.dueAt?.trim());}
