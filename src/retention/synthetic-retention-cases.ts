export type SyntheticRetentionCase={id:string;locale:'EN'|'ES';scenario:'REVIEW'|'RENEWAL'|'SEASONAL_RECALL'|'CROSS_SELL'|'CHURN_RISK'|'DNC_BLOCK';expectedExternalActionAuthorized:false};

export const SYNTHETIC_RETENTION_CASES:SyntheticRetentionCase[]=[
 {id:'ret-en-review-01',locale:'EN',scenario:'REVIEW',expectedExternalActionAuthorized:false},
 {id:'ret-es-review-01',locale:'ES',scenario:'REVIEW',expectedExternalActionAuthorized:false},
 {id:'ret-en-renewal-01',locale:'EN',scenario:'RENEWAL',expectedExternalActionAuthorized:false},
 {id:'ret-es-seasonal-01',locale:'ES',scenario:'SEASONAL_RECALL',expectedExternalActionAuthorized:false},
 {id:'ret-en-cross-sell-01',locale:'EN',scenario:'CROSS_SELL',expectedExternalActionAuthorized:false},
 {id:'ret-es-churn-01',locale:'ES',scenario:'CHURN_RISK',expectedExternalActionAuthorized:false},
 {id:'ret-en-dnc-01',locale:'EN',scenario:'DNC_BLOCK',expectedExternalActionAuthorized:false}
];
