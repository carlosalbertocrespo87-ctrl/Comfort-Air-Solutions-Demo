export type DataField={name:string;required:boolean;purpose?:string};
export type DataMinimizationResult={allowed:boolean;unjustified:string[]};
export function evaluateDataMinimization(fields:DataField[]):DataMinimizationResult{
 const unjustified=fields.filter(f=>!f.required||!f.purpose?.trim()).map(f=>f.name);
 return {allowed:unjustified.length===0,unjustified};
}
