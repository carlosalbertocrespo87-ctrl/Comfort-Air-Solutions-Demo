export type SalesReadinessPipeline={status:'READY_FOR_HUMAN_REVIEW'|'NEEDS_WORK'|'SUPPRESSED';blocking:string[];outreachAuthorized:false};
export function evaluateSalesReadinessPipeline(input:{suppressed:boolean;icpFit:boolean;evidenceReady:boolean;personalizationReady:boolean;claimSafetyPass:boolean;channelReady:boolean;demoReady:boolean}):SalesReadinessPipeline{
 if(input.suppressed) return {status:'SUPPRESSED',blocking:['Contact suppression applies.'],outreachAuthorized:false};
 const blocking:string[]=[];
 if(!input.icpFit) blocking.push('ICP fit is insufficient.');
 if(!input.evidenceReady) blocking.push('Evidence is incomplete.');
 if(!input.personalizationReady) blocking.push('Personalization is incomplete.');
 if(!input.claimSafetyPass) blocking.push('Sales claim safety failed.');
 if(!input.channelReady) blocking.push('No verified contact channel is ready.');
 if(!input.demoReady) blocking.push('Demo is not ready for internal preview.');
 return {status:blocking.length===0?'READY_FOR_HUMAN_REVIEW':'NEEDS_WORK',blocking,outreachAuthorized:false};
}
