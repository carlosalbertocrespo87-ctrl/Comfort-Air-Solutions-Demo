export type SlaStatus='ON_TIME'|'AT_RISK'|'BREACHED';
export function evaluateSla(input:{ageMinutes:number;targetMinutes:number;warningRatio?:number}):{status:SlaStatus;remainingMinutes:number}{
 const warning=input.warningRatio??0.75;
 const remaining=Math.max(0,input.targetMinutes-input.ageMinutes);
 if(input.ageMinutes>=input.targetMinutes) return {status:'BREACHED',remainingMinutes:0};
 if(input.ageMinutes>=input.targetMinutes*warning) return {status:'AT_RISK',remainingMinutes:remaining};
 return {status:'ON_TIME',remainingMinutes:remaining};
}
