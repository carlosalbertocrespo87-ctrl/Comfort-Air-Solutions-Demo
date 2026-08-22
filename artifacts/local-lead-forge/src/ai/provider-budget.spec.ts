import { PA02_DEFAULT_BUDGET, SpendGuard } from "./provider-budget";

const guard = new SpendGuard(PA02_DEFAULT_BUDGET);
if (!guard.canStart(0.005).allowed) throw new Error("small synthetic request should fit budget");
if (guard.canStart(0).allowed) throw new Error("missing request budget must block");
if (guard.canStart(0.02).allowed) throw new Error("per-request cap must block");
guard.record(0.045);
if (guard.canStart(0.01).allowed) throw new Error("session cap must block");
