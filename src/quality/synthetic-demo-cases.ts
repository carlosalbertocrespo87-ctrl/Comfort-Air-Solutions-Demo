export type SyntheticDemoCase={name:string;language:'EN'|'ES';expectedBlocking:boolean;scenario:string};
export const SYNTHETIC_DEMO_CASES:SyntheticDemoCase[]=[
 {name:'verified-en-hvac',language:'EN',expectedBlocking:false,scenario:'Verified services, verified city, working lead form, no unsupported claims.'},
 {name:'verified-es-hvac',language:'ES',expectedBlocking:false,scenario:'Servicios y ciudad verificados, formulario funcional y sin afirmaciones no comprobadas.'},
 {name:'unsupported-service',language:'EN',expectedBlocking:true,scenario:'Demo advertises duct cleaning without evidence.'},
 {name:'wrong-city',language:'ES',expectedBlocking:true,scenario:'Demo muestra una ciudad que no figura en la evidencia del prospecto.'},
 {name:'broken-lead-form',language:'EN',expectedBlocking:true,scenario:'Lead form fails or routes to an unsafe destination.'}
];
