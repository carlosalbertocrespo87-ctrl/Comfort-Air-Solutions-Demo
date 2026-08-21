-- LOCAL LEAD FORGE — CAPABILITY SEED
-- Installed capabilities remain fail-closed until prerequisites are objectively met.

insert into llf_capability_registry (capability_key, state, reason, prerequisites)
values
('BILINGUAL_EN_ES','READY','Core bilingual capability installed; activation depends on live AI/backend gates.', '{"requires_backend":true,"requires_ai":true}'::jsonb),
('PROMPT_INJECTION_DEFENSE','READY','Security baseline installed; enforcement activates with live AI traffic.', '{"requires_backend":true,"requires_security_qa":true}'::jsonb),
('PII_REDACTION','READY','Redaction policy installed; runtime enforcement activates with backend processing.', '{"requires_backend":true,"requires_security_qa":true}'::jsonb),
('KNOWLEDGE_GOVERNANCE','READY','Freshness/conflict governance installed; live use requires approved knowledge ingestion.', '{"requires_backend":true,"requires_approved_knowledge":true}'::jsonb),
('CONVERSATION_INTELLIGENCE','READY','Schema and analytics foundation installed.', '{"requires_backend":true,"requires_real_conversations":true}'::jsonb),
('KNOWLEDGE_GAP_AUTO_QUEUE','READY','Queue foundation installed; activation requires real conversation evidence.', '{"requires_backend":true,"requires_real_conversations":true}'::jsonb),
('QUALITY_INTERACTION_LEDGER','READY','Ledger schema installed; runtime capture activates with live conversation backend.', '{"requires_backend":true}'::jsonb),
('CONVERSATION_QA_SCORE','READY','QA scoring persistence installed; scoring activates when conversation evidence exists.', '{"requires_backend":true,"requires_real_conversations":true}'::jsonb),
('DEVICE_TRUST','READY','Trusted-device schema installed; activation requires authenticated agent identities.', '{"requires_auth":true,"requires_security_qa":true}'::jsonb),
('SECURE_IPHONE_PUSH','BLOCKED','Push foundation exists but remains blocked until trusted device, auth and push transport QA.', '{"requires_auth":true,"requires_trusted_device":true,"requires_push_transport":true,"requires_security_qa":true}'::jsonb),
('REALTIME_CONVERSATIONS','BLOCKED','Realtime contract exists; runtime activation waits for authenticated frontend integration and QA.', '{"requires_auth":true,"requires_backend":true,"requires_realtime_qa":true}'::jsonb),
('LEAD_HEAT','ADVISORY_ONLY','Model foundation installed; calibrate with real prospect evidence.', '{"requires_real_conversations":true}'::jsonb),
('NEXT_BEST_ACTION','ADVISORY_ONLY','Recommendation contract installed; external actions require separate approval gates.', '{"requires_real_conversations":true}'::jsonb),
('COMPANY_MEMORY','DORMANT','Activate only with provenance/consent and real client context.', '{"requires_real_clients":true,"requires_provenance":true}'::jsonb),
('CLIENT_HEALTH','DORMANT','Insufficient real client evidence for calibrated health scoring.', '{"requires_real_clients":true,"requires_minimum_history":true}'::jsonb),
('CHURN_INTELLIGENCE','DORMANT','Requires retained/cancelled client history before activation.', '{"requires_real_clients":true,"requires_churn_history":true}'::jsonb),
('REFERRAL_TIMING','DORMANT','Requires real satisfaction and referral conversion history.', '{"requires_real_clients":true,"requires_satisfaction_history":true}'::jsonb),
('UPSELL_INTELLIGENCE','DORMANT','Requires real product expansion and purchase evidence.', '{"requires_real_clients":true,"requires_product_expansion":true}'::jsonb)
on conflict (capability_key) do update
set state = excluded.state,
    reason = excluded.reason,
    prerequisites = excluded.prerequisites,
    last_evaluated_at = now();
