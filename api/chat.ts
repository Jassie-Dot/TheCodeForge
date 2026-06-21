import { createChatCompletion, type PublicChatMessage, type ResponseMode } from './chat-core'

declare const process: {
  env: Record<string, string | undefined>
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

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
  }

  let body: { messages?: PublicChatMessage[]; responseMode?: ResponseMode }

  try {
    body = (await request.json()) as { messages?: PublicChatMessage[]; responseMode?: ResponseMode }
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const result = await createChatCompletion(
    body.messages,
    process.env.GROQ_API_KEY,
    process.env.GROQ_MODEL,
    body.responseMode === 'voice' ? 'voice' : 'text',
  )

  return jsonResponse(result.body, { status: result.status })
}
