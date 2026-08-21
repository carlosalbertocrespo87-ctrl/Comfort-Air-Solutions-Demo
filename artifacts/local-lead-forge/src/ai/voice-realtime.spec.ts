import { SandboxVoiceProvider, defaultVoiceSessionConfig } from "./voice-realtime";

async function main() {
  const provider = new SandboxVoiceProvider();
  const config = defaultVoiceSessionConfig({ tenantId: "tenant-a", correlationId: "voice-1", locale: "es" });
  const session = await provider.createSession(config);
  if (session.status !== "CREATED") throw new Error("voice session must start CREATED");
  if (session.config.allowOutboundDial || session.config.allowPstnInbound || session.config.allowSms || session.config.allowCalendarBooking || session.config.allowCrmMutation || session.config.allowPaymentActions) {
    throw new Error("sandbox voice must not enable external actions");
  }
  const active = await provider.sendSyntheticTurn(session, { speaker: "caller", text: "El aire no enfría", locale: "es", synthetic: true });
  if (active.status !== "ACTIVE" || active.turns.length !== 1) throw new Error("synthetic turn should activate sandbox session");
  const ended = await provider.endSession(active);
  if (ended.status !== "ENDED") throw new Error("voice session must end cleanly");
}

void main();
