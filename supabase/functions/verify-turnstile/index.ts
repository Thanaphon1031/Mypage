const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { token } = await req.json()
    const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
    if (!secret || !token) return new Response(JSON.stringify({ success: false }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    const body = new URLSearchParams({ secret, response: token })
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
    return new Response(await result.text(), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch { return new Response(JSON.stringify({ success: false }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }) }
})
