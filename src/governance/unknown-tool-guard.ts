export type ToolDecision={allowed:boolean;reason:string};
export function authorizeTool(input:{toolName:string;allowlist:string[]}):ToolDecision{
 if(!input.toolName.trim()) return {allowed:false,reason:'Tool name is required.'};
 if(!input.allowlist.includes(input.toolName)) return {allowed:false,reason:'Unknown or non-allowlisted tool is denied.'};
 return {allowed:true,reason:'Tool is explicitly allowlisted.'};
}
