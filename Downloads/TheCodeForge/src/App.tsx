import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  AtSign,
  Brain,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Globe,
  Handshake,
  Mail,
  MessageSquare,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Video,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { motion, useReducedMotion, type Transition } from 'motion/react'
import { ExpandableTabs, type ExpandableTab } from './components/ui/expandable-tabs'

type Service = {
  title: string
  icon: LucideIcon
  description: string
  proof: string
}

const instagramUrl = 'https://www.instagram.com/_.codeforge._/'
const portfolioUrl = 'https://jaskaranveerportfolio.vercel.app'

const navTabs: ExpandableTab[] = [
  { title: 'Services', icon: Code2, target: 'services' },
  { title: 'Process', icon: Rocket, target: 'process' },
  { title: 'Proof', icon: ShieldCheck, target: 'proof' },
  { title: 'Connect', icon: MessageSquare, target: 'connect' },
]

const services: Service[] = [
  {
    title: 'Professional websites',
    icon: Globe,
    description:
      'Landing pages, portfolios, and client-ready business sites designed to make the first impression do real work.',
    proof: 'Responsive builds with clean sections, strong CTAs, and launch-ready polish.',
  },
  {
    title: 'Soft-skill sharpening',
    icon: Brain,
    description:
      'Communication, presentation flow, confidence, and client conversation systems for students and founders.',
    proof: 'Pitch scripts, delivery practice, and practical feedback loops.',
  },
  {
    title: 'Brand and content systems',
    icon: Sparkles,
    description:
      'A sharper message, stronger profile, and post ideas that make the service easy for clients to understand.',
    proof: 'Positioning, bio refreshes, service offers, and content angles.',
  },
  {
    title: 'Client conversion setup',
    icon: Handshake,
    description:
      'Simple inquiry journeys that turn views into DMs, booked calls, and clear project requirements.',
    proof: 'Contact prompts, lead questions, and project scope checklists.',
  },
]

const process = [
  {
    step: '01',
    title: 'Decode the goal',
    icon: MessageSquare,
    body: 'We start with what the client needs, what the page must prove, and what action visitors should take.',
  },
  {
    step: '02',
    title: 'Forge the experience',
    icon: Terminal,
    body: 'Copy, layout, visuals, and interaction details are shaped into a polished site or skill-building plan.',
  },
  {
    step: '03',
    title: 'Launch and connect',
    icon: Rocket,
    body: 'The final result makes it easy to DM, view proof, request pricing, or move into the next project step.',
  },
]

const proofPoints = [
  { label: 'Instagram audience', value: '89', icon: Users },
  { label: 'Contact path', value: 'DM', icon: AtSign },
  { label: 'Reply target', value: '24h', icon: Clock3 },
  { label: 'Core lanes', value: '4', icon: Briefcase },
]

const clientRequests = [
  'Portfolio website for a student or freelancer',
  'Professional business landing page',
  'Instagram profile and content upgrade',
  'Pitch, communication, and interview confidence',
]

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
}

const softSpring: Transition = { type: 'spring', stiffness: 220, damping: 28 }

function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [activeService, setActiveService] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  const revealTransition = useMemo<Transition>(
    () =>
      shouldReduceMotion
        ? { duration: 0 }
        : { type: 'spring', stiffness: 170, damping: 26 },
    [shouldReduceMotion],
  )

  const selectedService = services[activeService]
  const SelectedServiceIcon = selectedService.icon

  const handleNavChange = (index: number) => {
    setActiveTab(index)
    document.getElementById(navTabs[index].target)?.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <section className="relative min-h-[92svh] overflow-hidden border-b border-white/10">
        <img
          src="/codeforge-instagram.png"
          alt="The Code Forge Instagram page"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-24"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.86)_38%,rgba(5,5,5,0.58)_72%,rgba(5,5,5,0.78)_100%)]" />
        <div className="absolute inset-0 forge-grid opacity-35" />

        <div className="relative z-10 mx-auto flex min-h-[92svh] w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center gap-3 rounded-md text-left text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              aria-label="Open The Code Forge Instagram"
            >
              <span className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10">
                <Code2 className="h-5 w-5 text-cyan-200" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold">The Code Forge</span>
                <span className="block text-xs text-white/[0.58]">_.codeforge._</span>
              </span>
            </a>

            <ExpandableTabs
              tabs={navTabs}
              activeIndex={activeTab}
              onChange={handleNavChange}
              className="hidden lg:flex"
            />

            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="DM The Code Forge on Instagram"
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300 px-4 text-sm font-bold text-black transition duration-200 hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">DM now</span>
            </a>
          </header>

          <div className="flex flex-1 items-center py-16 md:py-20">
            <motion.div
              initial={shouldReduceMotion ? false : 'hidden'}
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08 },
                },
              }}
              className="max-w-4xl"
            >
              <motion.p
                variants={fadeUp}
                transition={revealTransition}
                className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm font-semibold text-cyan-100 backdrop-blur"
              >
                <Zap className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                Science, technology and client-ready skill building
              </motion.p>

              <motion.h1
                variants={fadeUp}
                transition={revealTransition}
                className="max-w-4xl text-5xl font-black leading-[0.95] text-white sm:text-6xl md:text-7xl lg:text-8xl"
              >
                The Code Forge
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={revealTransition}
                className="mt-6 max-w-2xl text-lg leading-8 text-white/[0.76] md:text-xl"
              >
                We build professional websites and sharpen the soft skills behind
                them: communication, confidence, portfolio presentation, and client
                conversion. This isn't coding. It's domination.
              </motion.p>

              <motion.div
                variants={fadeUp}
                transition={revealTransition}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <MotionLink
                  href={instagramUrl}
                  label="Connect on Instagram"
                  icon={Send}
                  primary
                  reducedMotion={shouldReduceMotion}
                />
                <MotionLink
                  href={portfolioUrl}
                  label="View portfolio"
                  icon={ArrowRight}
                  reducedMotion={shouldReduceMotion}
                />
              </motion.div>

              <motion.div
                variants={fadeUp}
                transition={revealTransition}
                className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
              >
                {proofPoints.map((point) => {
                  const Icon = point.icon
                  return (
                    <div
                      key={point.label}
                      className="rounded-md border border-white/10 bg-black/[0.38] p-4 backdrop-blur"
                    >
                      <Icon className="mb-3 h-5 w-5 text-cyan-200" aria-hidden="true" />
                      <div className="text-2xl font-black">{point.value}</div>
                      <div className="mt-1 text-xs font-semibold text-white/[0.58]">
                        {point.label}
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="services" className="relative border-b border-white/10 bg-[#0a0a0a] py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <Reveal reducedMotion={shouldReduceMotion}>
            <p className="section-kicker">What clients can get</p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              Websites, soft skills, and the connective tissue between them.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/[0.64]">
              CodeForge is built for people who want to look professional,
              communicate clearly, and make it easy for clients to take action.
            </p>

            <div className="mt-8 grid gap-3">
              {services.map((service, index) => {
                const Icon = service.icon
                const isActive = activeService === index
                return (
                  <button
                    key={service.title}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveService(index)}
                    className={`grid min-h-16 cursor-pointer grid-cols-[44px_1fr_20px] items-center gap-3 rounded-md border p-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                      isActive
                        ? 'border-emerald-300/40 bg-emerald-300/10 text-white'
                        : 'border-white/10 bg-white/[0.03] text-white/[0.72] hover:border-cyan-300/[0.35] hover:text-white'
                    }`}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-white/[0.08]">
                      <Icon className="h-5 w-5 text-cyan-200" aria-hidden="true" />
                    </span>
                    <span className="font-bold">{service.title}</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          </Reveal>

          <Reveal reducedMotion={shouldReduceMotion} delay={0.08}>
            <motion.div
              key={selectedService.title}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={softSpring}
              className="min-h-[460px] rounded-md border border-white/10 bg-[#101310] p-6 shadow-2xl shadow-black/[0.35] md:p-8"
              style={{ willChange: 'opacity, transform' }}
            >
              <div className="flex h-full flex-col justify-between gap-10">
                <div>
                  <div className="mb-8 grid h-16 w-16 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10">
                    <SelectedServiceIcon className="h-8 w-8 text-cyan-100" aria-hidden="true" />
                  </div>
                  <h3 className="text-3xl font-black md:text-5xl">
                    {selectedService.title}
                  </h3>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-white/[0.68]">
                    {selectedService.description}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md border border-white/10 bg-black/[0.24] p-5">
                    <CheckCircle2 className="mb-4 h-5 w-5 text-emerald-300" aria-hidden="true" />
                    <p className="text-sm leading-6 text-white/70">{selectedService.proof}</p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-black/[0.24] p-5">
                    <Mail className="mb-4 h-5 w-5 text-amber-300" aria-hidden="true" />
                    <p className="text-sm leading-6 text-white/70">
                      Clients can start with a simple DM: goal, deadline, budget, and
                      any reference pages they like.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <section id="process" className="border-b border-white/10 bg-[#050505] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal reducedMotion={shouldReduceMotion}>
            <div className="max-w-3xl">
              <p className="section-kicker">How it works</p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
                A simple path from attention to action.
              </h2>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {process.map((item, index) => {
              const Icon = item.icon
              return (
                <Reveal
                  key={item.title}
                  reducedMotion={shouldReduceMotion}
                  delay={index * 0.07}
                >
                  <article className="h-full rounded-md border border-white/10 bg-white/[0.035] p-6">
                    <div className="mb-8 flex items-center justify-between">
                      <span className="text-sm font-black text-emerald-300">{item.step}</span>
                      <span className="grid h-11 w-11 place-items-center rounded-md bg-white/[0.08]">
                        <Icon className="h-5 w-5 text-cyan-200" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="text-2xl font-black">{item.title}</h3>
                    <p className="mt-4 leading-7 text-white/[0.62]">{item.body}</p>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section id="proof" className="border-b border-white/10 bg-[#0c0d0c] py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <Reveal reducedMotion={shouldReduceMotion}>
            <div>
              <p className="section-kicker">Live proof</p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
                Built from the page clients already see.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/[0.64]">
                The website keeps the Instagram identity visible and turns that
                attention into clearer service choices.
              </p>
              <ul className="mt-8 grid gap-3">
                {clientRequests.map((request) => (
                  <li
                    key={request}
                    className="flex min-h-12 items-center gap-3 rounded-md border border-white/10 bg-black/[0.22] px-4 text-white/[0.76]"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
                    <span>{request}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal reducedMotion={shouldReduceMotion} delay={0.08}>
            <figure className="overflow-hidden rounded-md border border-white/10 bg-black">
              <img
                src="/codeforge-instagram.png"
                alt="Screenshot of the CodeForge Instagram profile"
                className="h-full max-h-[560px] w-full object-cover object-left-top"
              />
              <figcaption className="border-t border-white/10 px-5 py-4 text-sm text-white/60">
                Instagram profile reference for .codeforge._
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section id="connect" className="bg-[#050505] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal reducedMotion={shouldReduceMotion}>
            <div className="grid gap-8 rounded-md border border-emerald-300/25 bg-[linear-gradient(135deg,rgba(5,150,105,0.20),rgba(37,99,235,0.14)_48%,rgba(245,158,11,0.12))] p-6 md:grid-cols-[1fr_auto] md:p-10">
              <div>
                <p className="section-kicker">Ready to connect</p>
                <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
                  Send the project goal. CodeForge will shape the next move.
                </h2>
                <p className="mt-5 max-w-2xl leading-7 text-white/[0.68]">
                  Best first DM: what you need, when you need it, your budget
                  range, and any page or profile you want to beat.
                </p>
              </div>
              <div className="flex flex-col justify-end gap-3 sm:flex-row md:flex-col">
                <MotionLink
                  href={instagramUrl}
                  label="DM on Instagram"
                  icon={Send}
                  primary
                  reducedMotion={shouldReduceMotion}
                />
                <MotionLink
                  href={portfolioUrl}
                  label="Open portfolio"
                  icon={Video}
                  reducedMotion={shouldReduceMotion}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}

function MotionLink({
  href,
  label,
  icon: Icon,
  primary = false,
  reducedMotion,
}: {
  href: string
  label: string
  icon: LucideIcon
  primary?: boolean
  reducedMotion: boolean | null
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      whileHover={reducedMotion ? undefined : { y: -2 }}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md px-5 text-sm font-black transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 ${
        primary
          ? 'bg-emerald-300 text-black hover:bg-emerald-200 focus-visible:ring-emerald-100'
          : 'border border-white/[0.14] bg-white/[0.08] text-white hover:bg-white/[0.12] focus-visible:ring-cyan-200'
      }`}
      style={{ willChange: 'transform' }}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
      {primary ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
    </motion.a>
  )
}

function Reveal({
  children,
  delay = 0,
  reducedMotion,
}: {
  children: ReactNode
  delay?: number
  reducedMotion: boolean | null
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 160, damping: 24, delay }
      }
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  )
}

export default App
