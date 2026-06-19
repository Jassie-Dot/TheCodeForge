<<<<<<< HEAD
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createChatCompletion, type PublicChatMessage } from './api/chat-core'

function readBody(request: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = ''

    request.on('data', (chunk: Buffer) => {
      body += chunk.toString('utf8')
    })
    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

function localGeminiApi(apiKey: string | undefined): Plugin {
  return {
    name: 'local-gemini-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, { error: 'Method not allowed' })
          return
        }

        try {
          const parsed = JSON.parse(await readBody(request)) as { messages?: PublicChatMessage[] }
          const result = await createChatCompletion(parsed.messages, apiKey)
          sendJson(response, result.status, result.body)
        } catch {
          sendJson(response, 400, { error: 'Invalid chat request' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.GEMINI_API_KEY || env.GOOGLE_GEMINI_API_KEY || env.GOOGLE_API_KEY

  return {
    plugins: [react(), tailwindcss(), localGeminiApi(apiKey)],
  }
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
>>>>>>> 31ed656d8e789887d02f301e63f0177acbf44e84
})
