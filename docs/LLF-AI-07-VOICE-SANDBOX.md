# LLF AI-07 — Voice / Realtime Sandbox Abstraction

Status: COMPLETE (sandbox foundation)

## Purpose
Prepare the technical boundary for the future LLF AI Receptionist without enabling real phone calls, SMS, booking, CRM writes or payments.

## Delivered
- provider-agnostic VoiceRealtimeProvider contract
- SandboxVoiceProvider
- EN/ES session locale support
- synthetic turn/session lifecycle
- default five-minute session cap
- explicit hard-disabled outbound dialing, PSTN inbound, SMS, calendar booking, CRM mutation and payment actions
- mandatory human escalation categories for emergency, pricing, legal, financial and unsafe tool requests
- contract test for session creation, synthetic turn handling and safe shutdown

## Safety boundary
AI-07 is sandbox-only. It does not connect to a phone number or realtime model provider. All turns are marked synthetic=true. Production telephony requires a later explicit provider adapter, expanded evaluations, consent/privacy review, observability validation and AI-10 release evidence.

## Architecture intent
The production AI Receptionist should plug into this interface so the business logic remains independent from any single voice/model provider.
