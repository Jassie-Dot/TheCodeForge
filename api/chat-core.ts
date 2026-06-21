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

export type ResponseMode = 'text' | 'voice'

type GroqChatMessage = {
  role: 'assistant' | 'system' | 'user'
  content: string
}

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
  }
}

const defaultGroqModel = 'llama-3.3-70b-versatile'
const groqEndpoint = 'https://api.groq.com/openai/v1/chat/completions'

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
- If asked to book, schedule, send an email, or contact the team, act like a fast lead qualifier: collect only missing essentials and do not ask for an extra confirmation step.
- For appointment requests, ask only for missing essentials: name, email, preferred date/time, project type, and a short goal. Mention phone, budget, and timeline only as optional helpful details.
- For email briefs, ask only for missing essentials: name, email, project goal/message, pages/features needed, examples/references, timeline, budget range if known, and best contact method.
- If the site has enough details to send the appointment request or email brief, say it will be sent directly by the assistant flow. Do not claim that a request was sent unless the site confirms it.
- If the visitor gives partial details, ask only for the missing one or two most important details instead of repeating the full checklist.
- If the visitor asks to connect, talk, call, or WhatsApp a co-founder directly, do not ask for confirmation. Tell them the site will open WhatsApp directly.
- When the visitor asks broad questions like "what can you do", answer with specific service categories and examples, then suggest one next step.
- If the visitor gives an explicit response format or says "reply only", follow that formatting instruction exactly.
- Do not invent prices, availability, guarantees, or external integrations.
`.trim()

function sanitizeMessages(messages: PublicChatMessage[]): GroqChatMessage[] {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role as 'assistant' | 'user',
      content: String(message.content ?? '').slice(0, 4000),
    }))
    .filter((message) => message.content.trim().length > 0)
    .slice(-12)
}

function extractReply(payload: GroqResponse) {
  return payload.choices?.[0]?.message?.content?.trim() || ''
}

function prepareMessagesForMode(messages: GroqChatMessage[], responseMode: ResponseMode) {
  if (responseMode !== 'voice') {
    return messages
  }

  const preparedMessages = messages.map((message) => ({ ...message }))
  const latestUserMessageIndex = preparedMessages.findLastIndex((message) => message.role === 'user')

  if (latestUserMessageIndex >= 0) {
    preparedMessages[latestUserMessageIndex] = {
      ...preparedMessages[latestUserMessageIndex],
      content: [
        'Answer this as a live phone call.',
        'Use natural plain speech only.',
        'Maximum 2 short sentences.',
        'No Markdown. No headings. No bullets. No lists.',
        '',
        `User said: ${preparedMessages[latestUserMessageIndex].content}`,
      ].join('\n'),
    }
  }

  return preparedMessages
}

function buildSystemPrompt(responseMode: ResponseMode) {
  if (responseMode !== 'voice') {
    return systemPrompt
  }

  return `${systemPrompt}

Voice call mode:
- Reply like a concise human on a phone call.
- Your next answer must be at most 2 short sentences.
- Do not use Markdown, headings, bullets, numbered lists, or service catalogs.
- If the user asks a broad question, summarize the main idea and ask one helpful follow-up question.
- Prioritize fast back-and-forth conversation over completeness.`
}

export async function createChatCompletion(
  messages: PublicChatMessage[] | undefined,
  apiKey: string | undefined,
  model = defaultGroqModel,
  responseMode: ResponseMode = 'text',
): Promise<ChatResult> {
  if (!apiKey) {
    return {
      status: 500,
      body: {
        error: 'Groq is not configured yet. Add GROQ_API_KEY in your environment.',
      },
    }
  }

  const chatMessages = sanitizeMessages(Array.isArray(messages) ? messages : [])

  if (chatMessages.length === 0) {
    return {
      status: 400,
      body: { error: 'No chat messages provided' },
    }
  }

  const messagesForModel = prepareMessagesForMode(chatMessages, responseMode)
  const groqResponse = await fetch(groqEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(responseMode),
        },
        ...messagesForModel,
        ...(responseMode === 'voice'
          ? [
              {
                role: 'system' as const,
                content:
                  'For this next spoken response only: answer in natural plain speech, maximum 2 short sentences, no Markdown, no list.',
              },
            ]
          : []),
      ],
      temperature: 0.45,
      top_p: 0.9,
      max_completion_tokens: responseMode === 'voice' ? 90 : 700,
    }),
  })

  const payload = (await groqResponse.json().catch(() => ({}))) as GroqResponse

  if (!groqResponse.ok) {
    return {
      status: groqResponse.status,
      body: {
        error: payload.error?.message || 'Groq could not answer right now.',
      },
    }
  }

  const reply = extractReply(payload)

  if (!reply) {
    return {
      status: 502,
      body: { error: 'Groq returned an empty response.' },
    }
  }

  return {
    status: 200,
    body: { reply, model },
  }
}
