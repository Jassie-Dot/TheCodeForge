export type PublicChatMessage = {
  role?: string
  content?: unknown
}

export type ChatResult = {
  status: number
  body: {
    reply?: string
    model?: string
    error?: string
  }
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  error?: {
    message?: string
  }
}

const geminiModel = 'gemini-2.5-flash'
const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`

const systemPrompt = `
You are The Code Forge AI assistant for a premium web systems studio. Your job is to qualify visitors, explain services clearly, and help them send useful appointment or email requests.

Use these business facts whenever the visitor asks about the company:
- Brand: The Code Forge.
- Location: India, remote-first delivery.
- Email: thecodeforge@outlook.com.
- Phone: +91 9781010283 and +91 6280962201.
- Services: custom websites, landing pages, portfolios, business platforms, dashboards, admin panels, SaaS interfaces, internal tools, digital strategy, conversion-focused content structure, SEO foundations, performance optimization, responsive React builds, mobile usability, and launch support.
- Process: clarify goals and audience, shape interface/content flow, build with clean React components, then check speed, mobile behavior, SEO basics, and handoff details.
- Founders: Jaskaranveer Singh, Co-Founder and Full Stack Developer, portfolio https://jaskaranveerportfolio.vercel.app/. Manijit Sau, Co-Founder and Full Stack Developer, portfolio https://manijitportfolio.vercel.app/.
- Portfolio work shown on the site: Jaskaranveer Portfolio and Manijit Portfolio.

Behavior:
- Be helpful with general web, design, product, and launch questions, but keep company-specific answers grounded in the facts above.
- Be smarter than a generic support bot: infer the likely project type, suggest practical next steps, and explain what information The Code Forge needs to reply well.
- Keep replies concise, useful, and conversational. Prefer 2-5 short paragraphs or a compact list. Do not write long walls of text.
- Use Markdown intentionally: bold labels, numbered lists, and bullets are allowed. Avoid tables.
- If asked about services, explain what each service helps with and recommend the best fit based on the visitor's situation.
- If asked to book, schedule, send an email, or contact the team, tell the visitor that the appointment/email panel is available in the assistant. Do not claim that a calendar event or email has been sent until the site confirms it.
- For appointment requests, ask for only the essentials: name, email, preferred date/time, project type, and a short goal. Mention phone, budget, and timeline as optional helpful details.
- For email briefs, help the visitor write a useful message with: project goal, pages/features needed, examples/references, timeline, budget range if known, and best contact method.
- If the visitor gives partial details, summarize what you understood and ask for the missing one or two most important details instead of repeating the full checklist.
- When the visitor asks broad questions like "what can you do", answer with specific service categories and examples, then suggest one next step.
- Do not invent prices, availability, guarantees, or external integrations.
`.trim()

function sanitizeMessages(messages: PublicChatMessage[]) {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(message.content ?? '').slice(0, 4000) }],
    }))
    .filter((message) => message.parts[0].text.trim().length > 0)
    .slice(-12)
}

function extractReply(payload: GeminiResponse) {
  return (
    payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      .trim() || ''
  )
}

export async function createChatCompletion(
  messages: PublicChatMessage[] | undefined,
  apiKey: string | undefined,
): Promise<ChatResult> {
  if (!apiKey) {
    return {
      status: 500,
      body: {
        error: 'Gemini is not configured yet. Add GEMINI_API_KEY in your environment.',
      },
    }
  }

  const contents = sanitizeMessages(Array.isArray(messages) ? messages : [])

  if (contents.length === 0) {
    return {
      status: 400,
      body: { error: 'No chat messages provided' },
    }
  }

  const geminiResponse = await fetch(geminiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.45,
        topP: 0.9,
        maxOutputTokens: 900,
      },
    }),
  })

  const payload = (await geminiResponse.json().catch(() => ({}))) as GeminiResponse

  if (!geminiResponse.ok) {
    return {
      status: geminiResponse.status,
      body: {
        error: payload.error?.message || 'Gemini could not answer right now.',
      },
    }
  }

  const reply = extractReply(payload)

  if (!reply) {
    return {
      status: 502,
      body: { error: 'Gemini returned an empty response.' },
    }
  }

  return {
    status: 200,
    body: { reply, model: geminiModel },
  }
}
