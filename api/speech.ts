declare const process: {
  env: Record<string, string | undefined>
}

export const config = {
  runtime: 'edge',
}

const defaultVoiceId = 'JBFqnCBsd6RMkjVDRZzb'
const defaultTtsModel = 'eleven_flash_v2_5'

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

function getElevenLabsApiKey() {
  return process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_LABS_API_KEY
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
  }

  const apiKey = getElevenLabsApiKey()

  if (!apiKey) {
    return jsonResponse({ error: 'ElevenLabs is not configured yet. Add ELEVENLABS_API_KEY in your environment.' }, { status: 500 })
  }

  let body: { text?: unknown }

  try {
    body = (await request.json()) as { text?: unknown }
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const text = String(body.text ?? '').trim().slice(0, 2400)

  if (!text) {
    return jsonResponse({ error: 'No speech text provided' }, { status: 400 })
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || defaultVoiceId
  const modelId = process.env.ELEVENLABS_TTS_MODEL || defaultTtsModel
  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`
  const upstreamResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.42,
        similarity_boost: 0.82,
        style: 0.38,
        use_speaker_boost: true,
      },
    }),
  })

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    const errorText = await upstreamResponse.text().catch(() => '')
    return jsonResponse(
      { error: errorText || 'ElevenLabs could not generate speech right now.' },
      { status: upstreamResponse.status || 502 },
    )
  }

  return new Response(upstreamResponse.body, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': upstreamResponse.headers.get('Content-Type') || 'audio/mpeg',
    },
  })
}
