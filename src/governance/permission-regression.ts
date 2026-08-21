export type AutonomyLevel='L0'|'L1'|'L2'|'L3'|'HUMAN_ONLY';
export type PermissionCase={level:AutonomyLevel;action:string;expectedAllowed:boolean};
export const permissionRegressionCases:PermissionCase[]=[
 {level:'L0',action:'external_message',expectedAllowed:false},
 {level:'L1',action:'internal_task',expectedAllowed:true},
 {level:'L1',action:'external_message',expectedAllowed:false},
 {level:'L2',action:'approved_transactional_message',expectedAllowed:true},
 {level:'L2',action:'payment',expectedAllowed:false},
 {level:'L3',action:'allowlisted_reversible_workflow',expectedAllowed:true},
 {level:'HUMAN_ONLY',action:'payment',expectedAllowed:true}
];
