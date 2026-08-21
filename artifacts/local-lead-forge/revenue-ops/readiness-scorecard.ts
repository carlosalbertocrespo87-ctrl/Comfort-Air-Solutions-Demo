export interface ReadinessScorecard{qualification:boolean;demo:boolean;replyOps:boolean;discovery:boolean;proposal:boolean;payment:boolean;handoff:boolean;postPayment:boolean;ci:boolean;physicalQa:boolean;}
export function readinessPercent(x:ReadinessScorecard):number{const values=Object.values(x);return Math.round(values.filter(Boolean).length/values.length*100);}
export function readinessComplete(x:ReadinessScorecard):boolean{return readinessPercent(x)===100;}
