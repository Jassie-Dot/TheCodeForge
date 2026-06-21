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
import { Bot, CalendarCheck, Check, Mail, Mic, PhoneCall, PhoneOff, Send, Sparkles, Volume2, X } from 'lucide-react'
import { submitContactForm } from '../../lib/contact'

type ChatRole = 'user' | 'assistant'
type RequestMode = 'appointment' | 'email' | null
type RequestStatus = 'idle' | 'sending' | 'sent' | 'error'
type VoiceStatus = 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking' | 'error'

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

type ResponseMode = 'text' | 'voice'

type SendMessageOptions = {
  speakReply?: boolean
}

type RequestField = keyof RequestForm
type FounderWhatsAppContact = {
  name: string
  whatsappUrl: string
}

const panelSpring: Transition = { type: 'spring', stiffness: 320, damping: 34, mass: 0.76 }
const buttonSpring: Transition = { type: 'spring', stiffness: 420, damping: 32, mass: 0.62 }
const motionStyle: CSSProperties = { willChange: 'opacity, transform' }
const preferredAudioMimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
const voiceActivityThreshold = 0.035
const voiceTurnSilenceMs = 1000
const voiceTurnMinimumMs = 650
const voiceTurnMaximumMs = 45000
const voiceNoSpeechResetMs = 14000

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

const coFounderWhatsAppContacts: FounderWhatsAppContact[] = [
  {
    name: 'Jaskaranveer Singh',
    whatsappUrl: 'https://wa.me/919781010283',
  },
  {
    name: 'Manijit Sau',
    whatsappUrl: 'https://wa.me/916280967201',
  },
]

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const phonePattern = /(\+?\d[\d\s().-]{7,}\d)/
const usefulBriefSignals = [
  /\bweb\s+apps?\b/,
  /\bapps?\b/,
  /\bwebsites?\b/,
  /\bdashboards?\b/,
  /\bportfolios?\b/,
  /\blanding\s+pages?\b/,
  /\bbusiness\b/,
  /\be-?commerce\b/,
  /\bstores?\b/,
  /\bshops?\b/,
  /\bsaas\b/,
  /\bcrm\b/,
  /\badmin\b/,
  /\bbooking\s+(system|flow|website|app|platform)\b/,
  /\bprojects?\b/,
  /\bdesign\b/,
  /\bredesign\b/,
  /\bseo\b/,
  /\bpages?\b/,
  /\bfeatures?\b/,
  /\bbudget\b/,
  /\btimeline\b/,
  /\bstartup\b/,
  /\bbrand\b/,
  /\bcompany\b/,
  /\bplatform\b/,
  /\btools?\b/,
  /\bsystems?\b/,
]
const genericBriefWords = new Set([
  'a',
  'ai',
  'an',
  'and',
  'appointment',
  'book',
  'brief',
  'call',
  'code',
  'connect',
  'consult',
  'consultation',
  'contact',
  'email',
  'for',
  'forge',
  'i',
  'like',
  'mail',
  'make',
  'meeting',
  'message',
  'my',
  'need',
  'please',
  'schedule',
  'send',
  'team',
  'the',
  'to',
  'want',
  'with',
  'would',
])

function createMessageId() {
  if ('crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getCurrentTime() {
  return Date.now()
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

function pickFounderContact(text: string) {
  const normalized = text.toLowerCase()

  if (/\bmanijit\b/.test(normalized)) {
    return coFounderWhatsAppContacts[1]
  }

  if (/\b(jaskaranveer|jaskaran|jassi)\b/.test(normalized)) {
    return coFounderWhatsAppContacts[0]
  }

  return coFounderWhatsAppContacts[0]
}

function detectFounderConnectIntent(text: string) {
  const normalized = text.toLowerCase()
  const mentionsFounder = /\b(co[-\s]?founder|founder|jaskaranveer|jaskaran|jassi|manijit)\b/.test(normalized)
  const wantsDirectContact = /\b(connect|talk|speak|call|whatsapp|direct|directly|directty|now|baat)\b/.test(normalized)

  return mentionsFounder && wantsDirectContact ? pickFounderContact(text) : null
}

function openFounderWhatsApp(contact: FounderWhatsAppContact) {
  const message = encodeURIComponent('Hi, I want to connect directly with The Code Forge co-founder.')
  const separator = contact.whatsappUrl.includes('?') ? '&' : '?'
  const url = `${contact.whatsappUrl}${separator}text=${message}`
  const openedWindow = window.open(url, '_blank', 'noopener,noreferrer')

  if (!openedWindow) {
    window.location.assign(url)
  }
}

function isValidEmail(email: string) {
  return emailPattern.test(email.trim())
}

function extractEmail(text: string) {
  return text.match(emailPattern)?.[0] || ''
}

function extractPhone(text: string) {
  return text.match(phonePattern)?.[1]?.replace(/\s+/g, ' ').trim() || ''
}

function cleanNameCandidate(candidate: string) {
  const cleaned = candidate
    .replace(emailPattern, '')
    .split(/\b(?:and|but|email|mail|phone|mobile|number|preferred|time|project|website|app|appointment|meeting|brief|for|to|at)\b/i)[0]
    .replace(/[,.!?;:]+$/g, '')
    .trim()
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 4)
  const blockedFirstWords = new Set([
    'available',
    'booking',
    'calling',
    'from',
    'going',
    'here',
    'interested',
    'looking',
    'need',
    'planning',
    'ready',
    'sending',
    'trying',
    'want',
  ])

  if (words.length === 0 || blockedFirstWords.has(words[0].toLowerCase())) {
    return ''
  }

  return words.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ')
}

function extractName(text: string) {
  const patterns = [
    /\b(?:my name is|name is|this is)\s+([a-z][a-z.'-]*(?:\s+[a-z][a-z.'-]*){0,3})/i,
    /\b(?:i am|i'm|im)\s+([a-z][a-z.'-]*(?:\s+[a-z][a-z.'-]*){0,3})/i,
    /\bname\s*[:=-]\s*([a-z][a-z.'-]*(?:\s+[a-z][a-z.'-]*){0,3})/i,
    /\bname\s+([a-z][a-z.'-]*(?:\s+[a-z][a-z.'-]*){0,3})/i,
  ]

  for (const pattern of patterns) {
    const name = cleanNameCandidate(text.match(pattern)?.[1] || '')

    if (name) {
      return name
    }
  }

  return ''
}

function extractPreferredTime(text: string) {
  const patterns = [
    /\b(?:today|tomorrow|tonight|this\s+(?:morning|afternoon|evening|week|weekend)|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month)|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b(?:\s+(?:at|around|after|before|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?/i,
    /\b(?:at|around|after|before|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/i,
    /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i,
    /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/i,
    /\b(?:asap|urgent|soon|morning|afternoon|evening|weekend)\b/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)?.[0]?.trim()

    if (match) {
      return match
    }
  }

  return ''
}

function hasUsefulBrief(text: string) {
  const normalized = text
    .replace(emailPattern, ' ')
    .replace(phonePattern, ' ')
    .toLowerCase()
    .trim()

  if (!normalized || normalized.length < 18) {
    return false
  }

  if (usefulBriefSignals.some((signal) => signal.test(normalized))) {
    return true
  }

  const meaningfulWords = normalized
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !genericBriefWords.has(word))

  return meaningfulWords.length >= 4
}

function extractBriefDetails(text: string) {
  const directBrief = text.match(/\b(?:saying|message is|brief is|details are|project is|about)\s+(.+)/i)?.[1]?.trim()
  const candidate = directBrief || text

  return hasUsefulBrief(candidate) ? candidate : ''
}

function appendUniqueDetail(currentDetails: string, newDetails: string) {
  const details = newDetails.trim()

  if (!details) {
    return currentDetails
  }

  if (!currentDetails.trim()) {
    return details
  }

  if (currentDetails.toLowerCase().includes(details.toLowerCase())) {
    return currentDetails
  }

  return `${currentDetails.trim()}\n${details}`
}

function mergeRequestDetails(current: RequestForm, text: string, mode: Exclude<RequestMode, null>): RequestForm {
  const next = { ...current }
  const email = extractEmail(text)
  const phone = extractPhone(text)
  const name = extractName(text)
  const preferredTime = extractPreferredTime(text)
  const details = extractBriefDetails(text)

  if (email && (!next.email || !isValidEmail(next.email))) {
    next.email = email
  }

  if (phone && !next.phone) {
    next.phone = phone
  }

  if (name && !next.name) {
    next.name = name
  }

  if (preferredTime && !next.preferredTime) {
    next.preferredTime = preferredTime
  }

  if (details) {
    next.details = appendUniqueDetail(next.details, details)
  }

  if (mode === 'email' && !next.preferredTime && /\b(asap|urgent|soon|this week|next week|this month|next month)\b/i.test(text)) {
    next.preferredTime = extractPreferredTime(text) || text.trim()
  }

  return next
}

function getMissingRequestFields(form: RequestForm, mode: Exclude<RequestMode, null>) {
  const missing: RequestField[] = []

  if (!form.name.trim()) {
    missing.push('name')
  }

  if (!isValidEmail(form.email)) {
    missing.push('email')
  }

  if (mode === 'appointment' && !form.preferredTime.trim()) {
    missing.push('preferredTime')
  }

  if (form.details.trim().length < 10) {
    missing.push('details')
  }

  return missing
}

function shouldContinueRequestCollection(text: string) {
  return Boolean(
    extractEmail(text) ||
      extractPhone(text) ||
      extractName(text) ||
      extractPreferredTime(text) ||
      extractBriefDetails(text) ||
      /\b(send it|submit|done|go ahead|send now|that's all|thats all)\b/i.test(text),
  )
}

function formatMissingFields(fields: RequestField[], mode: Exclude<RequestMode, null>) {
  const labels = fields.map((field) => {
    if (field === 'preferredTime') {
      return mode === 'appointment' ? 'preferred date or time' : 'timeline'
    }

    if (field === 'details') {
      return mode === 'appointment' ? 'project goal' : 'email brief'
    }

    return field
  })

  if (labels.length <= 1) {
    return labels[0] || 'the missing details'
  }

  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

function buildMissingDetailsReply(mode: Exclude<RequestMode, null>, fields: RequestField[]) {
  const intro =
    mode === 'appointment'
      ? 'I can send that appointment request directly.'
      : 'I can send that email brief directly.'

  return `${intro} Please share ${formatMissingFields(fields, mode)}.`
}

function buildRequestSuccessReply(mode: Exclude<RequestMode, null>) {
  return mode === 'appointment'
    ? "Done. Your appointment request has been sent directly to The Code Forge team, and they'll reply with confirmation."
    : "Done. Your email brief has been sent directly to The Code Forge team, and they'll reply as soon as possible."
}

async function requestAiReply(messages: ChatMessage[], responseMode: ResponseMode = 'text') {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: messages.map(({ role, content }) => ({ role, content })),
      responseMode,
    }),
  })

  const data = (await response.json().catch(() => ({}))) as { reply?: string; error?: string }

  if (!response.ok || !data.reply) {
    throw new Error(data.error || 'The AI assistant is not reachable right now.')
  }

  return data.reply.trim()
}

async function requestVoiceTranscription(audioBlob: Blob) {
  const formData = new FormData()
  const extension = audioBlob.type.includes('mp4') ? 'mp4' : 'webm'

  formData.append('model_id', 'scribe_v2')
  formData.append('tag_audio_events', 'false')
  formData.append('no_verbatim', 'true')
  formData.append('file', audioBlob, `voice-message.${extension}`)

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  })
  const data = (await response.json().catch(() => ({}))) as { text?: string; error?: string }

  if (!response.ok || !data.text) {
    throw new Error(data.error || 'The voice message could not be transcribed.')
  }

  return data.text.trim()
}

async function requestSpeechAudio(text: string) {
  const response = await fetch('/api/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || 'The voice response could not be generated.')
  }

  return response.blob()
}

function getSupportedAudioMimeType() {
  if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
    return ''
  }

  return preferredAudioMimeTypes.find((mimeType) => window.MediaRecorder.isTypeSupported(mimeType)) || ''
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const submitRecordingRef = useRef(false)
  const callActiveRef = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const voiceActivityFrameRef = useRef<number | null>(null)
  const heardSpeechRef = useRef(false)
  const lastSpeechAtRef = useRef(0)
  const recordingStartedAtRef = useRef(0)
  const playbackRef = useRef<HTMLAudioElement | null>(null)
  const playbackUrlRef = useRef<string | null>(null)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [requestMode, setRequestMode] = useState<RequestMode>(null)
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle')
  const [requestForm, setRequestForm] = useState<RequestForm>(emptyRequestForm)
  const [callActive, setCallActive] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle')
  const [speechDetected, setSpeechDetected] = useState(false)
  const [lastTranscript, setLastTranscript] = useState('')
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
  const canUseVoice =
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    typeof window.AudioContext !== 'undefined' &&
    Boolean(window.navigator.mediaDevices?.getUserMedia)
  const voiceBusy = voiceStatus === 'transcribing' || voiceStatus === 'thinking' || voiceStatus === 'speaking'
  const voiceCaption = useMemo(() => {
    if (!canUseVoice) {
      return 'Voice recording is unavailable in this browser'
    }

    if (voiceError) {
      return voiceError
    }

    if (voiceStatus === 'recording') {
      return speechDetected ? 'Waiting for you to finish' : 'Listening for your voice'
    }

    if (voiceStatus === 'transcribing') {
      return 'Reading what you said'
    }

    if (voiceStatus === 'thinking') {
      return 'AI is thinking'
    }

    if (voiceStatus === 'speaking') {
      return 'AI is speaking'
    }

    if (lastTranscript) {
      return `Heard: ${lastTranscript}`
    }

    return callActive ? 'Ready to listen again' : 'Start a hands-free voice call'
  }, [callActive, canUseVoice, lastTranscript, speechDetected, voiceError, voiceStatus])
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
  const callButtonDisabled = !callActive && (!canUseVoice || voiceBusy || isThinking)
  const callButtonLabel = callActive ? 'End call' : 'Call AI'

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

  const cleanupVoiceActivity = (resetState = true) => {
    if (voiceActivityFrameRef.current !== null) {
      window.cancelAnimationFrame(voiceActivityFrameRef.current)
      voiceActivityFrameRef.current = null
    }

    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => undefined)
      audioContextRef.current = null
    }

    heardSpeechRef.current = false
    lastSpeechAtRef.current = 0
    recordingStartedAtRef.current = 0

    if (resetState) {
      setSpeechDetected(false)
    }
  }

  useEffect(() => {
    callActiveRef.current = callActive
  }, [callActive])

  useEffect(() => {
    return () => {
      submitRecordingRef.current = false

      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }

      cleanupVoiceActivity(false)
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
      playbackRef.current?.pause()

      if (playbackUrlRef.current) {
        URL.revokeObjectURL(playbackUrlRef.current)
      }
    }
  }, [])

  const startRequest = (mode: Exclude<RequestMode, null>, initialDetails?: string) => {
    setRequestMode(mode)
    setRequestStatus('idle')

    if (initialDetails) {
      setRequestForm((current) => ({
        ...mergeRequestDetails(current, initialDetails, mode),
      }))
    }
  }

  const cleanupPlayback = () => {
    playbackRef.current?.pause()
    playbackRef.current = null

    if (playbackUrlRef.current) {
      URL.revokeObjectURL(playbackUrlRef.current)
      playbackUrlRef.current = null
    }
  }

  const stopMediaStream = () => {
    cleanupVoiceActivity()
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
    mediaStreamRef.current = null
  }

  const startVoiceActivityWatch = async (stream: MediaStream, recorder: MediaRecorder) => {
    cleanupVoiceActivity()

    const audioContext = new window.AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)

    analyser.fftSize = 1024
    analyser.smoothingTimeConstant = 0.2
    const samples = new Uint8Array(analyser.fftSize)

    source.connect(analyser)
    audioContextRef.current = audioContext

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    recordingStartedAtRef.current = getCurrentTime()
    lastSpeechAtRef.current = recordingStartedAtRef.current

    const checkVoiceActivity = () => {
      if (!callActiveRef.current || mediaRecorderRef.current !== recorder || recorder.state !== 'recording') {
        return
      }

      analyser.getByteTimeDomainData(samples)

      let sum = 0
      for (const sample of samples) {
        const normalized = (sample - 128) / 128
        sum += normalized * normalized
      }

      const volume = Math.sqrt(sum / samples.length)
      const now = getCurrentTime()
      const elapsed = now - recordingStartedAtRef.current

      if (volume > voiceActivityThreshold) {
        lastSpeechAtRef.current = now

        if (!heardSpeechRef.current) {
          heardSpeechRef.current = true
          setSpeechDetected(true)
        }
      }

      if (!heardSpeechRef.current && elapsed > voiceNoSpeechResetMs) {
        stopRecording(false)
        window.setTimeout(() => {
          if (callActiveRef.current) {
            void startRecording(true)
          }
        }, 250)
        return
      }

      if (
        heardSpeechRef.current &&
        elapsed > voiceTurnMinimumMs &&
        (now - lastSpeechAtRef.current > voiceTurnSilenceMs || elapsed > voiceTurnMaximumMs)
      ) {
        stopRecording(true)
        return
      }

      voiceActivityFrameRef.current = window.requestAnimationFrame(checkVoiceActivity)
    }

    voiceActivityFrameRef.current = window.requestAnimationFrame(checkVoiceActivity)
  }

  const speakReply = async (reply: string) => {
    if (!callActiveRef.current) {
      setVoiceStatus('idle')
      return
    }

    cleanupPlayback()
    setVoiceError('')
    setVoiceStatus('speaking')

    try {
      const audioBlob = await requestSpeechAudio(reply)

      if (!callActiveRef.current) {
        setVoiceStatus('idle')
        return
      }

      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      playbackUrlRef.current = audioUrl
      playbackRef.current = audio

      audio.onended = () => {
        cleanupPlayback()
        setVoiceStatus('idle')

        window.setTimeout(() => {
          if (callActiveRef.current) {
            void startRecording(true)
          }
        }, 350)
      }
      audio.onerror = () => {
        cleanupPlayback()
        setVoiceStatus('error')
        setVoiceError('Voice playback failed.')
      }

      await audio.play()
    } catch (error) {
      cleanupPlayback()
      setVoiceStatus('error')
      setVoiceError(error instanceof Error ? error.message : 'Voice playback failed.')
    }
  }

  const submitQualifiedRequest = async (
    mode: Exclude<RequestMode, null>,
    form: RequestForm,
    sourceMessages: ChatMessage[],
  ) => {
    if (requestStatus === 'sending') {
      return { ok: false, reply: 'That request is already being sent.' }
    }

    setRequestStatus('sending')

    const formData = new FormData()
    const qualifiedBrief = buildAiQualifiedBrief({
      messages: sourceMessages,
      mode,
      requestForm: form,
    })

    formData.append(
      'subject',
      mode === 'appointment' ? `AI Chatbot Appointment Request - ${form.name}` : `AI Chatbot Email Brief - ${form.name}`,
    )
    formData.append('name', form.name)
    formData.append('email', form.email)
    formData.append('phone', form.phone)
    formData.append('preferred_time', form.preferredTime || 'Not provided')
    formData.append('message', qualifiedBrief)
    formData.append('request_type', mode)
    formData.append('source', 'The Code Forge AI chatbot')
    formData.append('visitor_brief', form.details)
    formData.append('ai_qualified_summary', qualifiedBrief)

    try {
      await submitContactForm(formData)

      const reply = buildRequestSuccessReply(mode)

      setRequestStatus('sent')
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: reply,
        },
      ])
      setRequestForm(emptyRequestForm)
      setRequestMode(null)

      return { ok: true, reply }
    } catch (error) {
      const reply = 'I could not send that request right now. Please check the connection and try again.'

      setRequestStatus('error')
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: reply,
        },
      ])
      console.error('Error sending chatbot request', error)

      return { ok: false, reply }
    }
  }

  const sendMessage = async (textOverride?: string, options: SendMessageOptions = {}) => {
    const text = (textOverride ?? input).trim()

    if (!text || isThinking || requestStatus === 'sending') {
      return
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: text,
    }
    const nextMessages = [...messages, userMessage]
    const founderContact = detectFounderConnectIntent(text)
    const intent = detectRequestMode(text)
    const activeRequestMode = intent ?? (requestMode && shouldContinueRequestCollection(text) ? requestMode : null)

    setMessages(nextMessages)
    setInput('')

    if (founderContact) {
      const reply = `Opening WhatsApp with ${founderContact.name} now.`

      setMessages([
        ...nextMessages,
        {
          id: createMessageId(),
          role: 'assistant',
          content: reply,
        },
      ])

      if (callActiveRef.current) {
        endVoiceCall()
      }

      openFounderWhatsApp(founderContact)
      return
    }

    if (activeRequestMode) {
      const nextRequestForm = mergeRequestDetails(requestForm, text, activeRequestMode)
      const missingFields = getMissingRequestFields(nextRequestForm, activeRequestMode)

      setRequestMode(activeRequestMode)
      setRequestStatus('idle')
      setRequestForm(nextRequestForm)

      if (missingFields.length > 0) {
        const reply = buildMissingDetailsReply(activeRequestMode, missingFields)

        setMessages([
          ...nextMessages,
          {
            id: createMessageId(),
            role: 'assistant',
            content: reply,
          },
        ])

        if (options.speakReply) {
          await speakReply(reply)
        }

        return
      }

      setIsThinking(true)

      if (options.speakReply) {
        setVoiceError('')
        setVoiceStatus('thinking')
      }

      try {
        const result = await submitQualifiedRequest(activeRequestMode, nextRequestForm, nextMessages)

        if (options.speakReply) {
          if (result.ok) {
            await speakReply(result.reply)
          } else {
            setVoiceStatus('error')
            setVoiceError(result.reply)
          }
        }
      } finally {
        setIsThinking(false)
      }

      return
    }

    setIsThinking(true)

    if (options.speakReply) {
      setVoiceError('')
      setVoiceStatus('thinking')
    }

    try {
      const reply = await requestAiReply(nextMessages, options.speakReply ? 'voice' : 'text')
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: reply,
        },
      ])

      if (options.speakReply) {
        await speakReply(reply)
      }
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

      if (options.speakReply) {
        setVoiceStatus('error')
        setVoiceError(message)
      }
    } finally {
      setIsThinking(false)
    }
  }

  const handleVoiceTurn = async (audioBlob: Blob) => {
    setVoiceError('')
    setVoiceStatus('transcribing')

    try {
      const transcript = await requestVoiceTranscription(audioBlob)

      if (!callActiveRef.current) {
        setVoiceStatus('idle')
        return
      }

      setLastTranscript(transcript)
      await sendMessage(transcript, { speakReply: true })
    } catch (error) {
      setVoiceStatus('error')
      setVoiceError(error instanceof Error ? error.message : 'The voice message could not be sent.')
    }
  }

  const startRecording = async (force = false) => {
    if (!canUseVoice || mediaRecorderRef.current?.state === 'recording' || (!force && (voiceBusy || isThinking))) {
      return
    }

    cleanupPlayback()
    setVoiceError('')
    setLastTranscript('')
    setSpeechDetected(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      const mimeType = getSupportedAudioMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const recordedMimeType = recorder.mimeType || 'audio/webm'

      audioChunksRef.current = []
      submitRecordingRef.current = true
      mediaStreamRef.current = stream
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      recorder.onstop = () => {
        const shouldSubmit = submitRecordingRef.current
        const chunks = [...audioChunksRef.current]

        audioChunksRef.current = []
        mediaRecorderRef.current = null
        stopMediaStream()

        if (!shouldSubmit) {
          setVoiceStatus('idle')
          return
        }

        if (chunks.length === 0) {
          setVoiceStatus('error')
          setVoiceError('No speech was captured.')
          return
        }

        void handleVoiceTurn(new Blob(chunks, { type: recordedMimeType }))
      }
      recorder.onerror = () => {
        submitRecordingRef.current = false
        stopMediaStream()
        setVoiceStatus('error')
        setVoiceError('Microphone recording failed.')
      }

      setCallActive(true)
      callActiveRef.current = true
      setVoiceStatus('recording')
      recorder.start()
      await startVoiceActivityWatch(stream, recorder)
    } catch (error) {
      submitRecordingRef.current = false

      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }

      stopMediaStream()
      setCallActive(false)
      callActiveRef.current = false
      setVoiceStatus('error')
      setVoiceError(error instanceof Error ? error.message : 'Microphone permission was denied.')
    }
  }

  const stopRecording = (submit = true) => {
    const recorder = mediaRecorderRef.current

    submitRecordingRef.current = submit

    if (recorder && recorder.state !== 'inactive') {
      setVoiceStatus(submit ? 'transcribing' : 'idle')
      recorder.stop()
      return
    }

    stopMediaStream()
    setVoiceStatus('idle')
  }

  const startVoiceCall = async () => {
    if (callActiveRef.current || !canUseVoice || voiceBusy || isThinking) {
      return
    }

    setOpen(true)
    await startRecording(true)
  }

  const endVoiceCall = () => {
    callActiveRef.current = false
    setCallActive(false)
    setVoiceError('')
    cleanupPlayback()

    if (mediaRecorderRef.current?.state === 'recording') {
      stopRecording(false)
      return
    }

    stopMediaStream()
    setVoiceStatus('idle')
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

    await submitQualifiedRequest(requestMode, requestForm, messages)
  }

  return (
    <div className="fixed bottom-5 left-5 z-50">
      <AnimatePresence>
        {open ? (
          <motion.section
            className="premium-surface absolute bottom-[9.25rem] left-0 flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-[8px]"
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

              <div className="mb-3 rounded-[8px] border border-white/10 bg-black/28 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                        voiceStatus === 'recording'
                          ? 'bg-red-400/16 text-red-100 ring-1 ring-red-300/35'
                          : voiceStatus === 'speaking'
                            ? 'bg-[#f2d39c]/16 text-[#f2d39c] ring-1 ring-[#f2d39c]/32'
                            : 'bg-white/[0.065] text-white/70 ring-1 ring-white/10'
                      }`}
                    >
                      {voiceStatus === 'speaking' ? (
                        <Volume2 className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Mic className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white">{callActive ? 'Voice call' : 'Talk to AI'}</p>
                      <p
                        className={`truncate text-[0.72rem] leading-5 ${
                          voiceStatus === 'error' || voiceError ? 'text-red-200' : 'text-white/52'
                        }`}
                        title={voiceCaption}
                      >
                        {voiceCaption}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <motion.button
                      type="button"
                      onClick={() => {
                        if (callActive) {
                          endVoiceCall()
                          return
                        }

                        void startVoiceCall()
                      }}
                      disabled={callButtonDisabled}
                      className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${
                        callActive ? 'border border-red-300/20 bg-red-400/14 text-red-100' : 'premium-button'
                      }`}
                      aria-label={callButtonLabel}
                      whileHover={shouldReduceMotion || callButtonDisabled ? undefined : { y: -1, scale: 1.02 }}
                      whileTap={shouldReduceMotion || callButtonDisabled ? undefined : { scale: 0.94 }}
                      transition={buttonSpring}
                    >
                      {callActive ? (
                        <PhoneOff className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span>{callButtonLabel}</span>
                    </motion.button>
                  </div>
                </div>
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

      <div className="flex flex-col items-start gap-3">
        <motion.button
          type="button"
          onClick={() => {
            if (callActive) {
              endVoiceCall()
              return
            }

            void startVoiceCall()
          }}
          disabled={callButtonDisabled}
          className={`inline-flex h-14 min-w-14 cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 md:gap-3 md:pr-5 ${
            callActive ? 'border border-red-300/20 bg-red-400/14 text-red-100 shadow-[0_18px_45px_rgba(248,113,113,0.18)]' : 'premium-button'
          }`}
          aria-label={callButtonLabel}
          aria-pressed={callActive}
          whileHover={shouldReduceMotion || callButtonDisabled ? undefined : { y: -3, scale: 1.025 }}
          whileTap={shouldReduceMotion || callButtonDisabled ? undefined : { scale: 0.94 }}
          transition={buttonSpring}
        >
          {callActive ? (
            voiceStatus === 'speaking' ? (
              <Volume2 className="h-5 w-5" aria-hidden="true" />
            ) : (
              <PhoneOff className="h-5 w-5" aria-hidden="true" />
            )
          ) : (
            <PhoneCall className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="md:hidden">{callActive ? 'End' : 'Call'}</span>
          <span className="hidden md:inline">{callButtonLabel}</span>
        </motion.button>

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
    </div>
  )
}
