export type BenchmarkBudget={maxPerRequestUsd:number;maxRunUsd:number;spendAuthorized:false};
export function benchmarkBudget(input?:{maxPerRequestUsd?:number;maxRunUsd?:number}):BenchmarkBudget{
 return {maxPerRequestUsd:Math.max(0,input?.maxPerRequestUsd??0),maxRunUsd:Math.max(0,input?.maxRunUsd??0),spendAuthorized:false};
}
