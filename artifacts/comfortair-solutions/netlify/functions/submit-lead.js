export default async (request, context) => {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405 },
    );
  }

  let lead;
  try {
    lead = await request.json();
  } catch {
    return Response.json(
      { error: 'Request body must be valid JSON' },
      { status: 400 },
    );
  }

  const requiredFields = ['name', 'phone', 'issue', 'location', 'timing'];
  const missingFields = requiredFields.filter(
    (field) => typeof lead?.[field] !== 'string' || !lead[field].trim(),
  );

  if (missingFields.length > 0) {
    return Response.json(
      {
        error: 'Missing required lead fields',
        fields: missingFields,
      },
      { status: 400 },
    );
  }

  console.log('ComfortAir lead received', lead);

  const resendApiKey = process.env.RESEND_API_KEY;
  const destinationEmail = process.env.LEAD_EMAIL;

  if (!resendApiKey || !destinationEmail) {
    console.error('ComfortAir lead email failed: email configuration is missing');
    return Response.json(
      { error: 'Unable to process lead' },
      { status: 500 },
    );
  }

  const escapeHtml = (value) =>
    value.replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[character],
    );

  const customerName = escapeHtml(lead.name);
  const phone = escapeHtml(lead.phone);
  const issue = escapeHtml(lead.issue);
  const location = escapeHtml(lead.location);
  const timing = escapeHtml(lead.timing);

  let emailResponse;
  try {
    emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ComfortAir Demo <onboarding@resend.dev>',
        to: [destinationEmail],
        subject: `🔥 NEW HVAC LEAD - ${lead.name} - ${lead.location}`,
        text: [
          'COMFORTAIR SOLUTIONS',
          'NEW CUSTOMER LEAD',
          '',
          `Customer: ${lead.name}`,
          `Phone: ${lead.phone}`,
          `Issue: ${lead.issue}`,
          `Location: ${lead.location}`,
          `Requested service: ${lead.timing}`,
          '',
          'This customer requested service through the ComfortAir AI Assistant. Contact them as soon as possible.',
          'Appointment and pricing have NOT been confirmed by the AI assistant.',
        ].join('\n'),
        html: `
          <div style="margin:0;background:#f4f0e8;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#183b45;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #d9e0dc;border-radius:16px;overflow:hidden;">
              <div style="background:#183b45;padding:28px 32px;color:#ffffff;">
                <div style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#f47735;">COMFORTAIR SOLUTIONS</div>
                <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;">NEW CUSTOMER LEAD</h1>
              </div>
              <div style="padding:32px;">
                <table role="presentation" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:0 0 20px;width:50%;vertical-align:top;">
                      <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#71818a;">Customer</div>
                      <div style="margin-top:6px;font-size:18px;font-weight:bold;color:#183b45;">${customerName}</div>
                    </td>
                    <td style="padding:0 0 20px;width:50%;vertical-align:top;">
                      <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#71818a;">Phone</div>
                      <div style="margin-top:6px;font-size:18px;font-weight:bold;color:#183b45;">${phone}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 20px;vertical-align:top;">
                      <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#71818a;">Problem</div>
                      <div style="margin-top:6px;font-size:16px;line-height:1.5;color:#183b45;">${issue}</div>
                    </td>
                    <td style="padding:0 0 20px;vertical-align:top;">
                      <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#71818a;">Location</div>
                      <div style="margin-top:6px;font-size:16px;line-height:1.5;color:#183b45;">${location}</div>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0 0 28px;vertical-align:top;">
                      <div style="font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#71818a;">Requested service</div>
                      <div style="margin-top:6px;font-size:16px;line-height:1.5;color:#183b45;">${timing}</div>
                    </td>
                  </tr>
                </table>
                <a href="tel:${phone}" style="display:block;border-radius:999px;background:#f47735;padding:16px 24px;text-align:center;font-size:16px;font-weight:bold;text-decoration:none;color:#183b45;">CALL CUSTOMER</a>
                <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#53666e;">This customer requested service through the ComfortAir AI Assistant. Contact them as soon as possible.</p>
                <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#71818a;">Appointment and pricing have NOT been confirmed by the AI assistant.</p>
              </div>
            </div>
          </div>
        `,
      }),
    });
  } catch (error) {
    console.error(
      'ComfortAir lead email failed',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return Response.json(
      { error: 'Unable to process lead' },
      { status: 500 },
    );
  }

  if (!emailResponse.ok) {
    console.error('ComfortAir lead email failed', {
      status: emailResponse.status,
      statusText: emailResponse.statusText,
    });
    return Response.json(
      { error: 'Unable to process lead' },
      { status: 500 },
    );
  }

  console.log('ComfortAir lead email sent');

  return Response.json({ success: true }, { status: 200 });
};