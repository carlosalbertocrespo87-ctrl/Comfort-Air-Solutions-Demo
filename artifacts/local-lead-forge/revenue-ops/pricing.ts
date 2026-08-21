export interface PricingRecord{setup:number;monthly:number;currency:'USD';sourceRef:string;effective:boolean;}
export function pricingCurrent(x:PricingRecord):boolean{return x.setup>=0&&x.monthly>0&&x.currency==='USD'&&Boolean(x.sourceRef?.trim())&&x.effective;}
export function canInventDiscount():boolean{return false;}
