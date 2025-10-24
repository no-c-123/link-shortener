import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
  console.log('Using RESEND_API_KEY:', Deno.env.get('RESEND_API_KEY'))
  if (req.method === 'OPTIONS') {
    return new Response('OK', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      },
    })
  }

  const { email, code } = await req.json()

  if (!email || !code) {
    return new Response(
      JSON.stringify({ error: 'Missing email or code' }),
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
        },
      }
    )
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'SnapLink <onboarding@resend.dev>',
      to: email,
      subject: 'Your SnapLink 2FA Code',
      html: `<h1>Your SnapLink 2FA Code</h1><p>Your code is: <strong>${code}</strong></p>`,
    }),
  })

  if (!resendResponse.ok) {
    const text = await resendResponse.text(); // this gives raw error
    console.error("Resend API error:", text);
  
    return new Response(
      JSON.stringify({ error: text }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
        },
      }
    )
  }

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      },
    }
  )
})