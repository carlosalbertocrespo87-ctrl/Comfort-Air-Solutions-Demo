# HVAC-COMP-01 — Revenue Lifecycle + Attribution

Issue: #104

## Purpose
Create a canonical, tenant-scoped revenue lifecycle that lets LLF measure economic outcomes instead of stopping at lead counts.

## Lifecycle
`source -> lead -> contacted -> appointment -> won/lost -> revenue`

## Attribution
First-touch attribution fields are preserved once known. Missing fields may be enriched later, but existing first-touch source/campaign data is not silently overwritten.

## Revenue evidence
Confirmed revenue and recovered revenue require explicit evidence records. Missing evidence fails closed. LLF must never fabricate recovered revenue to improve reporting.

## Safety boundary
This block is internal/synthetic only. It does not send messages, call customers, mutate live CRMs, charge/refund, or authorize external autonomy.

## Cost
Additional infrastructure cost target: $0.

## Definition of done
- typed lifecycle and attribution contracts
- transition guard
- first-touch preservation
- evidence-backed confirmed/recovered revenue
- lost reason required on lost stage
- synthetic contract tests
- normal repository checks before merge
