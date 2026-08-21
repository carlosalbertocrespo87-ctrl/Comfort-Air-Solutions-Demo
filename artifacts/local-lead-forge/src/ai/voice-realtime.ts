export type VoiceLocale = "en" | "es";
export type VoiceMode = "SANDBOX";

export type VoiceSessionConfig = {
  tenantId: string;
  correlationId: string;
  locale: VoiceLocale;
  mode: VoiceMode;
  maxSessionSeconds: number;
  allowOutboundDial: false;
  allowPstnInbound: false;
  allowSms: false;
  allowCalendarBooking: false;
  allowCrmMutation: false;
  allowPaymentActions: false;
  humanEscalationRequiredFor: Array<"emergency" | "pricing" | "legal" | "financial" | "unsafe_tool_request">;
};

export type VoiceTurn = {
  speaker: "caller" | "assistant";
  text: string;
  locale: VoiceLocale;
  synthetic: true;
};

export type VoiceSession = {
  id: string;
  config: VoiceSessionConfig;
  turns: VoiceTurn[];
  status: "CREATED" | "ACTIVE" | "ENDED";
};

export interface VoiceRealtimeProvider {
  readonly id: string;
  createSession(config: VoiceSessionConfig): Promise<VoiceSession>;
  sendSyntheticTurn(session: VoiceSession, turn: VoiceTurn): Promise<VoiceSession>;
  endSession(session: VoiceSession): Promise<VoiceSession>;
}

export class SandboxVoiceProvider implements VoiceRealtimeProvider {
  readonly id = "sandbox-voice";

  async createSession(config: VoiceSessionConfig): Promise<VoiceSession> {
    if (config.mode !== "SANDBOX") throw new Error("Voice provider is sandbox-only");
    if (config.allowOutboundDial || config.allowPstnInbound || config.allowSms || config.allowCalendarBooking || config.allowCrmMutation || config.allowPaymentActions) {
      throw new Error("Unsafe voice capability enabled");
    }
    return { id: `${config.tenantId}:${config.correlationId}`, config, turns: [], status: "CREATED" };
  }

  async sendSyntheticTurn(session: VoiceSession, turn: VoiceTurn): Promise<VoiceSession> {
    if (session.status === "ENDED") throw new Error("Voice session already ended");
    if (!turn.synthetic) throw new Error("Only synthetic voice turns are permitted");
    return { ...session, status: "ACTIVE", turns: [...session.turns, turn] };
  }

  async endSession(session: VoiceSession): Promise<VoiceSession> {
    return { ...session, status: "ENDED" };
  }
}

export function defaultVoiceSessionConfig(input: { tenantId: string; correlationId: string; locale: VoiceLocale }): VoiceSessionConfig {
  return {
    tenantId: input.tenantId,
    correlationId: input.correlationId,
    locale: input.locale,
    mode: "SANDBOX",
    maxSessionSeconds: 300,
    allowOutboundDial: false,
    allowPstnInbound: false,
    allowSms: false,
    allowCalendarBooking: false,
    allowCrmMutation: false,
    allowPaymentActions: false,
    humanEscalationRequiredFor: ["emergency", "pricing", "legal", "financial", "unsafe_tool_request"],
  };
}
