export type SyntheticRecoveryCase={id:string;scenario:string;expectedEligible:boolean;expectedExternalActionAuthorized:false};
export const SYNTHETIC_RECOVERY_CASES:SyntheticRecoveryCase[]=[
 {id:'missed-call-eligible',scenario:'Known-consent missed call with no DNC or complaint.',expectedEligible:true,expectedExternalActionAuthorized:false},
 {id:'dnc-block',scenario:'Lead has do-not-contact set.',expectedEligible:false,expectedExternalActionAuthorized:false},
 {id:'unknown-consent-block',scenario:'Consent status is unknown.',expectedEligible:false,expectedExternalActionAuthorized:false},
 {id:'complaint-block',scenario:'Lead has unresolved complaint.',expectedEligible:false,expectedExternalActionAuthorized:false},
 {id:'stale-review',scenario:'Closed lead inactive for more than 30 days with consent known.',expectedEligible:true,expectedExternalActionAuthorized:false},
 {id:'appointment-risk',scenario:'Unconfirmed appointment within 24 hours.',expectedEligible:true,expectedExternalActionAuthorized:false}
];
