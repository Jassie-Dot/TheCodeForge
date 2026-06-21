import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createChatCompletion, type PublicChatMessage, type ResponseMode } from './api/chat-core'

const defaultElevenLabsVoiceId = 'JBFqnCBsd6RMkjVDRZzb'
const defaultElevenLabsTtsModel = 'eleven_flash_v2_5'

function readBody(request: IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []

    request.on('data', (chunk: Buffer) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

async function sendFetchResponse(response: ServerResponse, upstreamResponse: Response) {
  response.statusCode = upstreamResponse.status
  upstreamResponse.headers.forEach((value, key) => {
    if (key !== 'content-encoding' && key !== 'transfer-encoding') {
      response.setHeader(key, value)
    }
  })
  response.end(Buffer.from(await upstreamResponse.arrayBuffer()))
}

function localGroqApi(apiKey: string | undefined, model: string | undefined): Plugin {
  return {
    name: 'local-groq-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, { error: 'Method not allowed' })
          return
        }

        try {
          const parsed = JSON.parse((await readBody(request)).toString('utf8')) as {
            messages?: PublicChatMessage[]
            responseMode?: ResponseMode
          }
          const result = await createChatCompletion(
            parsed.messages,
            apiKey,
            model,
            parsed.responseMode === 'voice' ? 'voice' : 'text',
          )
          sendJson(response, result.status, result.body)
        } catch {
          sendJson(response, 400, { error: 'Invalid chat request' })
        }
      })
    },
  }
}

function localElevenLabsApi({
  apiKey,
  ttsModel,
  voiceId,
}: {
  apiKey: string | undefined
  ttsModel: string
  voiceId: string
}): Plugin {
  return {
    name: 'local-elevenlabs-api',
    configureServer(server) {
      server.middlewares.use('/api/speech', async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, { error: 'Method not allowed' })
          return
        }

        if (!apiKey) {
          sendJson(response, 500, { error: 'ElevenLabs is not configured yet. Add ELEVENLABS_API_KEY in your environment.' })
          return
        }

        try {
          const parsed = JSON.parse((await readBody(request)).toString('utf8')) as { text?: unknown }
          const text = String(parsed.text ?? '').trim().slice(0, 2400)

          if (!text) {
            sendJson(response, 400, { error: 'No speech text provided' })
            return
          }

          const upstreamResponse = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
              },
              body: JSON.stringify({
                text,
                model_id: ttsModel,
                voice_settings: {
                  stability: 0.42,
                  similarity_boost: 0.82,
                  style: 0.38,
                  use_speaker_boost: true,
                },
              }),
            },
          )

          if (!upstreamResponse.ok) {
            sendJson(response, upstreamResponse.status, {
              error: (await upstreamResponse.text().catch(() => '')) || 'ElevenLabs could not generate speech right now.',
            })
            return
          }

          await sendFetchResponse(response, upstreamResponse)
        } catch {
          sendJson(response, 400, { error: 'Invalid speech request' })
        }
      })

      server.middlewares.use('/api/transcribe', async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, { error: 'Method not allowed' })
          return
        }

        if (!apiKey) {
          sendJson(response, 500, { error: 'ElevenLabs is not configured yet. Add ELEVENLABS_API_KEY in your environment.' })
          return
        }

        const contentType = request.headers['content-type']

        if (!contentType?.includes('multipart/form-data')) {
          sendJson(response, 400, { error: 'Voice transcription expects multipart form data.' })
          return
        }

        try {
          const upstreamResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
            method: 'POST',
            headers: {
              'Content-Type': contentType,
              'xi-api-key': apiKey,
            },
            body: await readBody(request),
          })
          const payload = (await upstreamResponse.json().catch(() => ({}))) as {
            text?: string
            language_code?: string
            error?: { message?: string }
          }

          if (!upstreamResponse.ok) {
            sendJson(response, upstreamResponse.status, {
              error: payload.error?.message || 'ElevenLabs could not transcribe the recording right now.',
            })
            return
          }

          const text = String(payload.text ?? '').trim()

          if (!text) {
            sendJson(response, 422, { error: 'No speech was detected in the recording.' })
            return
          }

          sendJson(response, 200, { text, languageCode: payload.language_code })
        } catch {
          sendJson(response, 400, { error: 'Invalid transcription request' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const groqApiKey = env.GROQ_API_KEY
  const groqModel = env.GROQ_MODEL
  const elevenLabsApiKey = env.ELEVENLABS_API_KEY || env.ELEVEN_LABS_API_KEY
  const elevenLabsVoiceId = env.ELEVENLABS_VOICE_ID || defaultElevenLabsVoiceId
  const elevenLabsTtsModel = env.ELEVENLABS_TTS_MODEL || defaultElevenLabsTtsModel

  return {
    plugins: [
      react(),
      tailwindcss(),
      localGroqApi(groqApiKey, groqModel),
      localElevenLabsApi({
        apiKey: elevenLabsApiKey,
        ttsModel: elevenLabsTtsModel,
        voiceId: elevenLabsVoiceId,
      }),
    ],
  }
})
