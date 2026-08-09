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

  return Response.json({ success: true }, { status: 200 });
};