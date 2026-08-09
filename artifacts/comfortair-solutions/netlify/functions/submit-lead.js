exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let lead;
  try {
    lead = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Request body must be valid JSON' }),
    };
  }

  const requiredFields = ['name', 'phone', 'issue', 'location', 'timing'];
  const missingFields = requiredFields.filter(
    (field) => typeof lead[field] !== 'string' || !lead[field].trim(),
  );

  if (missingFields.length > 0) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Missing required lead fields',
        fields: missingFields,
      }),
    };
  }

  console.info('ComfortAir lead received', lead);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true }),
  };
};