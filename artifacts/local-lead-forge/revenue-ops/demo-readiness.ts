export interface DemoReadiness{businessEvidence:boolean;brandingChecked:boolean;contactFactsChecked:boolean;mobileQa:boolean;desktopQa:boolean;leadFlowQa:boolean;noFabricatedClaims:boolean;}
export function demoReady(x:DemoReadiness):boolean{return Object.values(x).every(Boolean);}
