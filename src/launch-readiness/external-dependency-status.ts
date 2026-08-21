export type ExternalDependencyState='READY'|'WAITING'|'FAILED'|'NOT_REQUIRED';
export type ExternalDependency={name:string;state:ExternalDependencyState;ownerActionRequired:boolean;evidence?:string};
export function summarizeExternalDependencies(items:ExternalDependency[]){
 const waiting=items.filter(i=>i.state==='WAITING'||i.state==='FAILED');
 return {ready:waiting.length===0,waiting:waiting.map(i=>i.name),ownerActions:waiting.filter(i=>i.ownerActionRequired).map(i=>i.name),externalMutationAuthorized:false as const};
}
