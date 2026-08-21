export type SyntheticLaunchCase={id:string;locale:'en-US'|'es-US';scenario:string;expectedHold:boolean;synthetic:true};
export const syntheticLaunchCases:SyntheticLaunchCase[]=[
 {id:'en-green-internal',locale:'en-US',scenario:'All internal evidence and simulation gates pass.',expectedHold:false,synthetic:true},
 {id:'en-payment-block',locale:'en-US',scenario:'Payout destination remains unverified.',expectedHold:true,synthetic:true},
 {id:'es-address-wait',locale:'es-US',scenario:'La aprobación final de la dirección comercial sigue pendiente.',expectedHold:true,synthetic:true},
 {id:'es-critical-risk',locale:'es-US',scenario:'Existe un riesgo crítico abierto antes del lanzamiento.',expectedHold:true,synthetic:true}
];
