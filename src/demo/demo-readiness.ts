export type DemoReadiness={readyForInternalPreview:boolean;readyForPublish:false;blocking:string[]};
export function evaluateDemoReadiness(input:{briefBuilt:boolean;factsVerified:boolean;qaPass:boolean;brandingReady:boolean;leadDestinationSafe:boolean}):DemoReadiness{
 const blocking:string[]=[];
 if(!input.briefBuilt) blocking.push('Demo brief missing.');
 if(!input.factsVerified) blocking.push('Business facts are not verified.');
 if(!input.qaPass) blocking.push('Demo QA has blocking failures.');
 if(!input.brandingReady) blocking.push('Branding assets/configuration are incomplete.');
 if(!input.leadDestinationSafe) blocking.push('Lead destination is not approved/safe for demo use.');
 return {readyForInternalPreview:blocking.length===0,readyForPublish:false,blocking};
}
