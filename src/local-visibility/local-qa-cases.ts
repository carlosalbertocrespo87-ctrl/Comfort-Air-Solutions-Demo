export type LocalVisibilitySyntheticCase={id:string;locale:'en-US'|'es-US';scenario:string;expectedHumanReview:boolean;synthetic:true};
export const localVisibilitySyntheticCases:LocalVisibilitySyntheticCase[]=[
 {id:'en-nap-conflict',locale:'en-US',scenario:'Public profile phone conflicts with website phone.',expectedHumanReview:true,synthetic:true},
 {id:'en-complete-profile',locale:'en-US',scenario:'All core local profile facts are evidenced and consistent.',expectedHumanReview:false,synthetic:true},
 {id:'es-area-unverified',locale:'es-US',scenario:'La demo menciona una ciudad sin evidencia de área de servicio.',expectedHumanReview:true,synthetic:true},
 {id:'es-review-gating',locale:'es-US',scenario:'El flujo solicita reseña solo a clientes con sentimiento positivo.',expectedHumanReview:true,synthetic:true},
 {id:'en-duplicate-profile',locale:'en-US',scenario:'Two public profile URLs share phone and similar business name.',expectedHumanReview:true,synthetic:true}
];
