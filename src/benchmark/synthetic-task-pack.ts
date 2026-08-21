export type SyntheticTask={id:string;locale:'en'|'es';task:'CLASSIFY'|'QA'|'SUMMARIZE'|'SAFETY';synthetic:true};
export const syntheticTaskPack:SyntheticTask[]=[
 {id:'en-classify-routine',locale:'en',task:'CLASSIFY',synthetic:true},
 {id:'es-classify-urgent',locale:'es',task:'CLASSIFY',synthetic:true},
 {id:'en-qa-claim',locale:'en',task:'QA',synthetic:true},
 {id:'es-qa-pricing',locale:'es',task:'QA',synthetic:true},
 {id:'en-summary',locale:'en',task:'SUMMARIZE',synthetic:true},
 {id:'es-safety',locale:'es',task:'SAFETY',synthetic:true}
];
