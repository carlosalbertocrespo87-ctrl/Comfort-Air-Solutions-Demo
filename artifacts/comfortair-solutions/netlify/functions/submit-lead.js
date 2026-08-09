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
        subject: `New HVAC Lead - ${lead.name}`,
        text: [
          'New ComfortAir Lead',
          `Customer: ${lead.name}`,
          `Phone: ${lead.phone}`,
          `Issue: ${lead.issue}`,
          `Location: ${lead.location}`,
          `Requested timing: ${lead.timing}`,
        ].join('\n'),
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