declare const process: {
  env: Record<string, string | undefined>
}

type ElevenLabsTranscript = {
  text?: string
  language_code?: string
  error?: {
    message?: string
  }
}

export const config = {
  runtime: 'edge',
}

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

  const contentType = request.headers.get('Content-Type')

  if (!contentType?.includes('multipart/form-data')) {
    return jsonResponse({ error: 'Voice transcription expects multipart form data.' }, { status: 400 })
  }

  const upstreamResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'xi-api-key': apiKey,
    },
    body: request.body,
  })
  const payload = (await upstreamResponse.json().catch(() => ({}))) as ElevenLabsTranscript

  if (!upstreamResponse.ok) {
    return jsonResponse(
      { error: payload.error?.message || 'ElevenLabs could not transcribe the recording right now.' },
      { status: upstreamResponse.status },
    )
  }

  const text = String(payload.text ?? '').trim()

  if (!text) {
    return jsonResponse({ error: 'No speech was detected in the recording.' }, { status: 422 })
  }

  return jsonResponse({
    text,
    languageCode: payload.language_code,
  })
}
