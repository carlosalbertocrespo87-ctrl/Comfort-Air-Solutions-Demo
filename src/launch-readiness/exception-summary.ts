export type LaunchException={id:string;area:string;blocking:boolean;ownerActionRequired:boolean;note:string};
export function summarizeLaunchExceptions(items:LaunchException[]){
 return {blocking:items.filter(i=>i.blocking),ownerActions:items.filter(i=>i.ownerActionRequired),count:items.length,externalResolutionAuthorized:false as const};
}
