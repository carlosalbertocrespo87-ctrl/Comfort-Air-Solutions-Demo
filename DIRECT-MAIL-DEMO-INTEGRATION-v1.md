# Local Lead Forge — Direct Mail → Demo Integration v1

Status: READY FOR IMPLEMENTATION

## Goal
Make physical outreach and prospect demos work as one measurable funnel without changing the core demo safety contract.

## Physical piece role
The printed piece should earn attention, not explain the entire service. It should contain:
- Prospect company name.
- One visual from or representative of the prospect-specific demo.
- One concrete, non-guaranteed benefit statement.
- One QR code.
- One short URL fallback under localleadforge.com.
- Local Lead Forge branding.

## Recommended front-copy
**We built this for [Company].**

See how your website could make it easier for potential customers to request HVAC service — including visitors who prefer Spanish or who do not call first.

**Scan to see your private demo.**

Local Lead Forge  
localleadforge.com

## Claim rules
Allowed examples:
- "Built to help turn more website visitors into service opportunities."
- "Make it easier for potential customers to request service."
- "Capture service requests from visitors who do not call first."

Do not claim or imply guaranteed leads, sales, revenue, booked jobs, ROI or rankings.

## QR route contract
Each physical prospect gets a unique campaign route or parameter that resolves only to the correct private demo under `localleadforge.com`.

Example pattern:
`https://localleadforge.com/d/[prospect-slug]?src=mail`

Email may use the same demo with a different source marker, e.g. `?src=email`, only if source measurement is implemented in a privacy-respecting way.

## Measurement rules
Track only what is legitimately available and necessary:
- piece prepared
- piece mailed
- returned/undeliverable when known
- QR/demo visit when legitimate measurement exists
- demo interaction when legitimate measurement exists
- response
- meeting
- won/lost

Never claim a prospect viewed or read something unless measured evidence exists.

## Release gate
Do not print, purchase postage or mail any piece without explicit owner authorization. Generic commands such as "procede", "adelante" or "sigue" authorize preparation only.

Before physical release:
1. Physical address independently verified.
2. Company name and recipient/addressee verified.
3. Demo route passes Pre-Send QA Gate equivalent checks.
4. QR resolves to the correct demo.
5. Printed fallback URL is readable.
6. Claims are compliant.
7. Cost logged in LLF finances.
8. Explicit physical-send authorization recorded.
