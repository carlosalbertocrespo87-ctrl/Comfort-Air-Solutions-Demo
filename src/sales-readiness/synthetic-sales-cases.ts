export type SyntheticSalesCase={id:string;locale:'en-US'|'es-US';scenario:string;expectedStatus:'READY_FOR_HUMAN_REVIEW'|'NEEDS_WORK'|'SUPPRESSED';synthetic:true};
export const syntheticSalesCases:SyntheticSalesCase[]=[
 {id:'en-ready',locale:'en-US',scenario:'Verified HVAC prospect with safe claims, demo and public contact evidence.',expectedStatus:'READY_FOR_HUMAN_REVIEW',synthetic:true},
 {id:'en-opt-out',locale:'en-US',scenario:'Prospect has an opt-out record.',expectedStatus:'SUPPRESSED',synthetic:true},
 {id:'es-unverified',locale:'es-US',scenario:'Prospecto HVAC con afirmaciones sin evidencia.',expectedStatus:'NEEDS_WORK',synthetic:true},
 {id:'es-no-channel',locale:'es-US',scenario:'Prospecto verificado pero sin canal de contacto público/autorizado.',expectedStatus:'NEEDS_WORK',synthetic:true}
];
