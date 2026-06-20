import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react'
import { Bot, CalendarCheck, Check, Mail, Send, Sparkles, X } from 'lucide-react'
import { submitContactForm } from '../../lib/contact'

type ChatRole = 'user' | 'assistant'
type RequestMode = 'appointment' | 'email' | null
type RequestStatus = 'idle' | 'sending' | 'sent' | 'error'

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
}

type RequestForm = {
  name: string
  email: string
  phone: string
  preferredTime: string
  details: string
}

type QuickAction = {
  label: string
  prompt: string
  mode?: Exclude<RequestMode, null>
}

const panelSpring: Transition = { type: 'spring', stiffness: 320, damping: 34, mass: 0.76 }
const buttonSpring: Transition = { type: 'spring', stiffness: 420, damping: 32, mass: 0.62 }
const motionStyle: CSSProperties = { willChange: 'opacity, transform' }

const quickActions: QuickAction[] = [
  {
    label: 'Services',
    prompt: 'Tell me what The Code Forge can build for my business.',
  },
  {
    label: 'Book',
    prompt: 'I want to book an appointment with The Code Forge.',
    mode: 'appointment',
  },
  {
    label: 'Email',
    prompt: 'I want to send an email brief to The Code Forge.',
    mode: 'email',
  },
]

const emptyRequestForm: RequestForm = {
  name: '',
  email: '',
  phone: '',
  preferredTime: '',
  details: '',
}

function createMessageId() {
  if ('crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function detectRequestMode(text: string): RequestMode {
  const normalized = text.toLowerCase()

  if (/\b(appointment|schedule|meeting|consultation|consult|call|book)\b/.test(normalized)) {
    return 'appointment'
  }

  if (/\b(email|mail|message|brief|proposal|contact)\b/.test(normalized)) {
    return 'email'
  }

  return null
}

async function requestAiReply(messages: ChatMessage[]) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: messages.map(({ role, content }) => ({ role, content })),
    }),
  })

  const data = (await response.json().catch(() => ({}))) as { reply?: string; error?: string }

  if (!response.ok || !data.reply) {
    throw new Error(data.error || 'The AI assistant is not reachable right now.')
  }

  return data.reply.trim()
}

function MessageText({ content, role }: { content: string; role: ChatRole }) {
  const blocks = parseMessageBlocks(content)
  const isUser = role === 'user'

  return (
    <div className="grid gap-2.5">
      {blocks.map((block, index) => {
        if (block.type === 'ordered-list') {
          return (
            <ol
              key={`ordered-${index}`}
              className={`grid list-decimal gap-2 pl-5 leading-6 ${isUser ? 'marker:text-[#080604]/70' : 'marker:text-[#f2d39c]'}`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item, isUser)}</li>
              ))}
            </ol>
          )
        }

        if (block.type === 'unordered-list') {
          return (
            <ul
              key={`unordered-${index}`}
              className={`grid list-disc gap-2 pl-5 leading-6 ${isUser ? 'marker:text-[#080604]/70' : 'marker:text-[#f2d39c]'}`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item, isUser)}</li>
              ))}
            </ul>
          )
        }

        if (block.type === 'heading') {
          return (
            <p key={`heading-${index}`} className={`text-sm font-bold leading-6 ${isUser ? 'text-[#080604]' : 'text-white'}`}>
              {renderInlineMarkdown(block.text, isUser)}
            </p>
          )
        }

        return (
          <p key={`paragraph-${index}`} className="leading-6">
            {renderInlineMarkdown(block.text, isUser)}
          </p>
        )
      })}
    </div>
  )
}

type MessageBlock =
  | { type: 'heading'; text: string }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'paragraph'; text: string }
  | { type: 'unordered-list'; items: string[] }

function parseMessageBlocks(content: string): MessageBlock[] {
  const lines = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
  const blocks: MessageBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line) {
      index += 1
      continue
    }

    const orderedItems: string[] = []
    while (index < lines.length) {
      const match = lines[index].match(/^\d+\.\s+(.*)$/)

      if (!match) {
        break
      }

      orderedItems.push(match[1])
      index += 1
    }

    if (orderedItems.length > 0) {
      blocks.push({ type: 'ordered-list', items: orderedItems })
      continue
    }

    const unorderedItems: string[] = []
    while (index < lines.length) {
      const match = lines[index].match(/^[-*]\s+(.*)$/)

      if (!match) {
        break
      }

      unorderedItems.push(match[1])
      index += 1
    }

    if (unorderedItems.length > 0) {
      blocks.push({ type: 'unordered-list', items: unorderedItems })
      continue
    }

    const headingMatch = line.match(/^#{1,3}\s+(.*)$/)

    if (headingMatch) {
      blocks.push({ type: 'heading', text: headingMatch[1] })
      index += 1
      continue
    }

    const paragraphLines = [line]
    index += 1

    while (
      index < lines.length &&
      lines[index] &&
      !/^\d+\.\s+/.test(lines[index]) &&
      !/^[-*]\s+/.test(lines[index]) &&
      !/^#{1,3}\s+/.test(lines[index])
    ) {
      paragraphLines.push(lines[index])
      index += 1
    }

    blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') })
  }

  return blocks
}

function renderInlineMarkdown(text: string, darkText = false): ReactNode[] {
  const nodes: ReactNode[] = []
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean)

  parts.forEach((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      nodes.push(
        <strong key={`${part}-${index}`} className={`font-bold ${darkText ? 'text-[#080604]' : 'text-white'}`}>
          {part.slice(2, -2)}
        </strong>,
      )
      return
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      nodes.push(
        <code
          key={`${part}-${index}`}
          className={`rounded px-1 py-0.5 text-[0.92em] ${darkText ? 'bg-black/10 text-[#080604]' : 'bg-black/40 text-[#f2d39c]'}`}
        >
          {part.slice(1, -1)}
        </code>,
      )
      return
    }

    nodes.push(part)
  })

  return nodes
}

function buildAiQualifiedBrief({
  messages,
  mode,
  requestForm,
}: {
  messages: ChatMessage[]
  mode: Exclude<RequestMode, null>
  requestForm: RequestForm
}) {
  const recentContext = messages
    .slice(-8)
    .map((message) => `${message.role === 'assistant' ? 'Assistant' : 'Visitor'}: ${message.content}`)
    .join('\n\n')
  const suggestedFollowUp =
    mode === 'appointment'
      ? 'Confirm availability, clarify scope, and suggest a short discovery call agenda.'
      : 'Review the brief, identify the likely service fit, and reply with next questions or a recommended start plan.'

  return [
    `AI-qualified ${mode === 'appointment' ? 'appointment request' : 'email brief'} from The Code Forge chatbot`,
    '',
    `Visitor name: ${requestForm.name}`,
    `Visitor email: ${requestForm.email}`,
    `Visitor phone: ${requestForm.phone || 'Not provided'}`,
    `${mode === 'appointment' ? 'Preferred appointment time' : 'Timeline'}: ${requestForm.preferredTime || 'Not provided'}`,
    '',
    'Visitor brief:',
    requestForm.details,
    '',
    'Suggested team follow-up:',
    suggestedFollowUp,
    '',
    'Recent assistant context:',
    recentContext || 'No recent chat context captured.',
  ].join('\n')
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5" aria-label="Assistant is thinking">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-[#f2d39c]"
          animate={{ opacity: [0.28, 1, 0.28], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.12 }}
        />
      ))}
    </div>
  )
}

export function AiChatbot() {
  const shouldReduceMotion = useReducedMotion()
  const messageListRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [requestMode, setRequestMode] = useState<RequestMode>(null)
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle')
  const [requestForm, setRequestForm] = useState<RequestForm>(emptyRequestForm)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi, I'm The Code Forge assistant. Ask about services, pricing direction, process, portfolio work, or book a project appointment.",
    },
  ])

  const requestTitle = requestMode === 'appointment' ? 'Book appointment' : 'Send email brief'
  const requestIntro =
    requestMode === 'appointment'
      ? 'Share a preferred time and project context. This sends an appointment request directly to the team.'
      : 'Write the brief you want delivered. This sends it directly to the team inbox.'
  const panelDimensions = useMemo<CSSProperties>(() => {
    if (requestMode) {
      return {
        height: 'min(760px, calc(100dvh - 6rem))',
        width: 'min(760px, calc(100vw - 2.5rem))',
      }
    }

    if (messages.length > 3) {
      return {
        height: 'min(720px, calc(100dvh - 6rem))',
        width: 'min(560px, calc(100vw - 2.5rem))',
      }
    }

    return {
      height: 'min(620px, calc(100dvh - 7rem))',
      width: 'min(430px, calc(100vw - 2.5rem))',
    }
  }, [messages.length, requestMode])

  const canSendMessage = input.trim().length > 0 && !isThinking

  const visibleMessages = useMemo(() => messages.slice(-12), [messages])

  useEffect(() => {
    if (!open) {
      return
    }

    const id = window.setTimeout(() => inputRef.current?.focus(), 140)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (!messageListRef.current) {
      return
    }

    messageListRef.current.scrollTop = messageListRef.current.scrollHeight
  }, [messages, isThinking, requestMode])

  const startRequest = (mode: Exclude<RequestMode, null>, initialDetails?: string) => {
    setRequestMode(mode)
    setRequestStatus('idle')

    if (initialDetails) {
      setRequestForm((current) => ({
        ...current,
        details: current.details || initialDetails,
      }))
    }
  }

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim()

    if (!text || isThinking) {
      return
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: text,
    }
    const nextMessages = [...messages, userMessage]
    const intent = detectRequestMode(text)

    setMessages(nextMessages)
    setInput('')

    if (intent) {
      startRequest(intent, text)
    }

    setIsThinking(true)

    try {
      const reply = await requestAiReply(nextMessages)
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: reply,
        },
      ])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The AI assistant is not reachable right now.'
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: `${message} You can still use the appointment or email panel here, and the message will go straight to The Code Forge team.`,
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage()
  }

  const updateRequestField =
    (field: keyof RequestForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setRequestForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }

  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!requestMode || requestStatus === 'sending') {
      return
    }

    setRequestStatus('sending')

    const formData = new FormData()
    const qualifiedBrief = buildAiQualifiedBrief({
      messages,
      mode: requestMode,
      requestForm,
    })

    formData.append(
      'subject',
      requestMode === 'appointment'
        ? `AI Chatbot Appointment Request - ${requestForm.name}`
        : `AI Chatbot Email Brief - ${requestForm.name}`,
    )
    formData.append('name', requestForm.name)
    formData.append('email', requestForm.email)
    formData.append('phone', requestForm.phone)
    formData.append('preferred_time', requestForm.preferredTime || 'Not provided')
    formData.append('message', qualifiedBrief)
    formData.append('request_type', requestMode)
    formData.append('source', 'The Code Forge AI chatbot')
    formData.append('visitor_brief', requestForm.details)
    formData.append('ai_qualified_summary', qualifiedBrief)

    try {
      await submitContactForm(formData)
      setRequestStatus('sent')
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content:
            requestMode === 'appointment'
              ? "Done. Your appointment request has been sent directly to The Code Forge team, and they'll reply with confirmation."
              : "Done. Your email brief has been sent directly to The Code Forge team, and they'll reply as soon as possible.",
        },
      ])
      setRequestForm(emptyRequestForm)
      setRequestMode(null)
    } catch (error) {
      setRequestStatus('error')
      console.error('Error sending chatbot request', error)
    }
  }

  return (
    <div className="fixed bottom-5 left-5 z-50">
      <AnimatePresence>
        {open ? (
          <motion.section
            className="premium-surface absolute bottom-16 left-0 flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-[8px]"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
            transition={shouldReduceMotion ? { duration: 0.01 } : panelSpring}
            style={{ ...motionStyle, ...panelDimensions }}
            aria-label="The Code Forge AI assistant"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#f2d39c,#c99355)] text-[#080604]">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">The Code Forge AI</p>
                  <p className="truncate text-xs text-white/52">Details, booking, and email requests</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.055] text-white transition-colors hover:bg-white/[0.09]"
                aria-label="Close AI assistant"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            <div
              ref={messageListRef}
              className={`ai-chat-scroll overflow-y-auto px-4 py-4 ${
                requestMode ? 'max-h-[34dvh] min-h-[112px] shrink-0 sm:max-h-[260px]' : 'flex-1'
              }`}
            >
              <div className="grid gap-3">
                {visibleMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={shouldReduceMotion ? { duration: 0.01 } : panelSpring}
                    style={motionStyle}
                  >
                    <div
                      className={`max-w-[86%] rounded-[8px] px-4 py-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-[linear-gradient(135deg,#f2d39c,#c99355)] text-[#080604]'
                          : 'border border-white/10 bg-white/[0.065] text-white/82'
                      }`}
                    >
                      <MessageText content={message.content} role={message.role} />
                    </div>
                  </motion.div>
                ))}

                {isThinking ? (
                  <motion.div
                    className="flex justify-start"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={shouldReduceMotion ? { duration: 0.01 } : panelSpring}
                    style={motionStyle}
                  >
                    <div className="rounded-[8px] border border-white/10 bg-white/[0.065] px-4 py-3">
                      <ThinkingDots />
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </div>

            <div className="flex min-h-0 shrink flex-col border-t border-white/10 px-4 py-3">
              <div className="mb-3 flex shrink-0 flex-wrap gap-2">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.label}
                    type="button"
                    onClick={() => {
                      if (action.mode) {
                        startRequest(action.mode, action.prompt)
                      }

                      void sendMessage(action.prompt)
                    }}
                    className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 text-xs font-bold text-white/74 transition-colors hover:border-[#f2d39c]/34 hover:text-white"
                    whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                    transition={buttonSpring}
                  >
                    {action.mode === 'appointment' ? (
                      <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : action.mode === 'email' ? (
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {action.label}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {requestMode ? (
                  <motion.form
                    onSubmit={handleRequestSubmit}
                    className="ai-chat-scroll mb-3 grid shrink min-h-0 gap-3 overflow-y-auto border-t border-white/10 pr-1 pt-3 sm:pr-2"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={shouldReduceMotion ? { duration: 0.01 } : panelSpring}
                    style={motionStyle}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-white">{requestTitle}</p>
                        <p className="mt-1 text-xs leading-5 text-white/52">{requestIntro}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRequestMode(null)}
                        className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.045] text-white/70"
                        aria-label="Close request form"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={requestForm.name}
                        onChange={updateRequestField('name')}
                        placeholder="Name"
                        autoComplete="name"
                        required
                        className="min-h-11 rounded-[8px] border border-white/12 bg-black/55 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#f2d39c]/70"
                      />
                      <input
                        value={requestForm.email}
                        onChange={updateRequestField('email')}
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        required
                        className="min-h-11 rounded-[8px] border border-white/12 bg-black/55 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#f2d39c]/70"
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={requestForm.phone}
                        onChange={updateRequestField('phone')}
                        type="tel"
                        placeholder="Phone"
                        autoComplete="tel"
                        className="min-h-11 rounded-[8px] border border-white/12 bg-black/55 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#f2d39c]/70"
                      />
                      <input
                        value={requestForm.preferredTime}
                        onChange={updateRequestField('preferredTime')}
                        placeholder={requestMode === 'appointment' ? 'Preferred time' : 'Timeline'}
                        required={requestMode === 'appointment'}
                        className="min-h-11 rounded-[8px] border border-white/12 bg-black/55 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#f2d39c]/70"
                      />
                    </div>
                    <textarea
                      value={requestForm.details}
                      onChange={updateRequestField('details')}
                      rows={3}
                      placeholder={requestMode === 'appointment' ? 'Project and meeting notes' : 'Email brief'}
                      required
                      className="min-h-24 resize-y rounded-[8px] border border-white/12 bg-black/55 px-3 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#f2d39c]/70"
                    />
                    {requestStatus === 'error' ? (
                      <p className="text-xs leading-5 text-red-200">
                        The request could not be sent. Please check your connection and try again.
                      </p>
                    ) : null}
                    <motion.button
                      type="submit"
                      disabled={requestStatus === 'sending'}
                      className="premium-button inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-70"
                      whileHover={shouldReduceMotion || requestStatus === 'sending' ? undefined : { scale: 1.012 }}
                      whileTap={shouldReduceMotion || requestStatus === 'sending' ? undefined : { scale: 0.96 }}
                      transition={buttonSpring}
                    >
                      {requestStatus === 'sending' ? 'Sending...' : requestMode === 'appointment' ? 'Send Appointment' : 'Send Email'}
                      {requestStatus === 'sent' ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Send className="h-4 w-4" aria-hidden="true" />
                      )}
                    </motion.button>
                  </motion.form>
                ) : null}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="flex shrink-0 items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void sendMessage()
                    }
                  }}
                  rows={1}
                  placeholder="Ask anything..."
                  className="min-h-12 flex-1 resize-none rounded-[8px] border border-white/12 bg-black/55 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#f2d39c]/70"
                  aria-label="Ask the AI assistant"
                />
                <motion.button
                  type="submit"
                  disabled={!canSendMessage}
                  className="premium-button grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-full border-0 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                  whileHover={shouldReduceMotion || !canSendMessage ? undefined : { y: -1, scale: 1.035 }}
                  whileTap={shouldReduceMotion || !canSendMessage ? undefined : { scale: 0.94 }}
                  transition={buttonSpring}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </motion.button>
              </form>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="premium-button inline-flex h-14 min-w-14 cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-4 text-sm font-bold md:gap-3 md:pr-5"
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={open}
        whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.025 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
        transition={buttonSpring}
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Bot className="h-5 w-5" aria-hidden="true" />}
        <span className="md:hidden">{open ? 'Close' : 'AI'}</span>
        <span className="hidden md:inline">{open ? 'Close AI' : 'Ask AI'}</span>
      </motion.button>
    </div>
  )
}
