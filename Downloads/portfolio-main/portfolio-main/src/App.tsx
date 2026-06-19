import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ComponentType,
  type ReactNode,
} from 'react'
import {
  ArrowRight,
  Award,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  CodeXml,
  ExternalLink,
  GitBranch,
  Loader2,
  Mail,
  MessageCircle,
  Monitor,
  Moon,
  Play,
  Rocket,
  Send,
  Shuffle,
  Smartphone,
  Sun,
  Trophy,
  Zap,
} from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Transition,
} from 'motion/react'

import './App.css'
import heroLayer from '@/assets/hero.png'
import { Card } from '@/components/ui/card'
import { SplineScene } from '@/components/ui/splite'

type Project = {
  title: string
  description: string
  tags: string[]
  href?: string
  embedPreview?: boolean
}

type Experience = {
  title: string
  period: string
  org: string
  description: string
}

type Hackathon = {
  title: string
  event: string
  year: string
  description: string
}

type Theme = 'dark' | 'light'

type ThemeTransitionState = {
  id: number
  from: Theme
}

type LivePreviewProject = Project & {
  href: string
}

type LivePreviewMode = 'desktop' | 'mobile'

const projects: Project[] = [
  {
    title: 'Aurora Table Cafe',
    description:
      'A polished cafe website with a refined menu experience, atmospheric visuals, and smooth responsive browsing.',
    tags: ['Cafe', 'Vercel', 'Responsive'],
    href: 'https://aurora-table-cafe.vercel.app/',
  },
  {
    title: 'Cafe Website',
    description:
      'A modern cafe landing experience built for quick exploration, clear sections, and clean food-service presentation.',
    tags: ['Restaurant', 'Frontend', 'Vercel'],
    href: 'https://cafe-website-alpha-seven.vercel.app/',
  },
  {
    title: 'TR Enterprises',
    description:
      'A business website for presenting services, brand details, and customer contact paths through a direct web presence.',
    tags: ['Business', 'Website', 'Vercel'],
    href: 'https://tr-enterpriises.vercel.app/',
    embedPreview: false,
  },
  {
    title: 'South Cafe Pizza',
    description:
      'A pizza cafe website focused on menu discovery, bold product presentation, and mobile-friendly browsing.',
    tags: ['Food', 'Pizza', 'Responsive'],
    href: 'https://south-cafe-pizza.vercel.app/',
  },
  {
    title: 'Sentinel Pro AI',
    description:
      'Self-evolving AI platform concept with modular plugin architecture, adaptability, automation, and intelligent decision-making.',
    tags: ['AI', 'Automation', 'Architecture'],
  },
]

const livePreviewProjects = projects.filter(hasLivePreview)

const skills = [
  'C++',
  'Python',
  'JavaScript',
  'HTML5',
  'CSS3',
  'Responsive Design',
  'Frontend Development',
  'AI Development',
  'Prompt Engineering',
  'Plugin-Based Systems',
  'Automation Systems',
  'Git & GitHub',
  'VS Code',
  'Vercel',
  'Figma',
  'Codex',
]

const experiences: Experience[] = [
  {
    title: 'Freelance Developer',
    period: 'Current',
    org: 'Online clients and independent projects',
    description:
      'Delivered technology solutions for clients through web development, AI solutions, digital projects, requirement gathering, and implementation.',
  },
  {
    title: 'B.Tech Information Technology',
    period: '2nd Year',
    org: 'Guru Nanak Dev Engineering College, Ludhiana',
    description:
      'Building a strong foundation in software development, AI systems, web technologies, and practical engineering problem solving.',
  },
  {
    title: 'AI Product Builder',
    period: 'Ongoing',
    org: 'Sentinel Pro AI and automation prototypes',
    description:
      'Designing practical AI tools, automation flows, assistant concepts, and user-facing experiments with a shipping mindset.',
  },
]

const hackathons: Hackathon[] = [
  {
    title: 'Intercollege Hackathon Win',
    event: 'Competitive build sprint',
    year: 'Winner',
    description: 'Recognized for fast problem-solving, idea execution, and building a working solution under pressure.',
  },
  {
    title: 'Intercollege Hackathon Win',
    event: 'Innovation challenge',
    year: 'Winner',
    description: 'Won by combining technical execution, presentation clarity, and practical product thinking.',
  },
]

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/Jassie-Dot', icon: GitBranch },
  { label: 'Email', href: 'mailto:jassie.08191@gmail.com', icon: Mail },
  { label: 'WhatsApp', href: 'https://wa.me/9781010283', icon: MessageCircle },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
}

const spring: Transition = { type: 'spring', stiffness: 170, damping: 24 }
const snappySpring: Transition = { type: 'spring', stiffness: 320, damping: 24 }
const instant: Transition = { duration: 0 }
const themeToggleSpring: Transition = { type: 'spring', stiffness: 520, damping: 34, mass: 0.55 }
const themeStorageKey = 'portfolio-theme'
const deckPerspectiveStyle = { perspective: 1200 }
const desktopDeckPoses = [
  { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
  { x: -230, y: 36, scale: 0.9, rotate: -7, opacity: 0.72 },
  { x: 230, y: 54, scale: 0.88, rotate: 7, opacity: 0.68 },
  { x: -315, y: 120, scale: 0.76, rotate: -12, opacity: 0.38 },
  { x: 315, y: 128, scale: 0.74, rotate: 12, opacity: 0.34 },
]
const mobileDeckPoses = [
  { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
  { x: 0, y: 24, scale: 0.94, rotate: -4, opacity: 0.62 },
  { x: 0, y: 48, scale: 0.88, rotate: 4, opacity: 0.34 },
  { x: 0, y: 66, scale: 0.82, rotate: -2, opacity: 0 },
  { x: 0, y: 66, scale: 0.82, rotate: 2, opacity: 0 },
]
const hiddenDeckPose = { x: 0, y: 72, scale: 0.78, rotate: 0, opacity: 0 }
const shootingStars = [
  { id: 'upper-east', top: '12%', left: '78%', width: 156, travel: 280, delay: 0.8, duration: 3.7, repeatDelay: 8.8 },
  { id: 'hero-cross', top: '26%', left: '91%', width: 118, travel: 230, delay: 4.6, duration: 3.2, repeatDelay: 10.5 },
  { id: 'midnight-line', top: '44%', left: '72%', width: 142, travel: 260, delay: 8.4, duration: 3.5, repeatDelay: 9.6 },
  { id: 'lower-west', top: '67%', left: '88%', width: 132, travel: 250, delay: 12.2, duration: 3.4, repeatDelay: 11.2 },
  { id: 'footer-drift', top: '82%', left: '66%', width: 108, travel: 210, delay: 16.8, duration: 3.1, repeatDelay: 12.4 },
]

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
    cancelIdleCallback?: (handle: number) => void
  }

function App() {
  const shouldReduceMotion = useReducedMotion()
  const transition = shouldReduceMotion ? instant : spring
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())
  const [themeTransition, setThemeTransition] = useState<ThemeTransitionState | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(themeStorageKey, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle(
      'theme-transition-active',
      Boolean(themeTransition) && !shouldReduceMotion,
    )

    return () => {
      document.documentElement.classList.remove('theme-transition-active')
    }
  }, [shouldReduceMotion, themeTransition])

  useEffect(() => {
    if (!themeTransition || shouldReduceMotion) {
      return
    }

    const timeout = window.setTimeout(() => {
      setThemeTransition(null)
    }, 720)

    return () => window.clearTimeout(timeout)
  }, [shouldReduceMotion, themeTransition])

  const handleThemeToggle = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'

    if (!shouldReduceMotion) {
      setThemeTransition((current) => ({
        id: (current?.id ?? 0) + 1,
        from: theme,
      }))
    }

    setTheme(nextTheme)
  }, [shouldReduceMotion, theme])

  const handleThemeTransitionComplete = useCallback((transitionId: number) => {
    setThemeTransition((current) => (current?.id === transitionId ? null : current))
  }, [])

  return (
    <>
      <ScrollProgress />
      <ThemeSwitchTransition transitionState={themeTransition} onComplete={handleThemeTransitionComplete} />
      <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
      <main className="relative isolate min-h-screen w-full overflow-hidden bg-background text-foreground">
        <ShootingStars />
        <div className="relative z-10">
          <Hero transition={transition} shouldReduceMotion={Boolean(shouldReduceMotion)} />

          <Section
            eyebrow="Featured Work"
            title="Projects"
            description="A selection of my recent work showcasing AI systems, web development, and real-world delivery."
            muted
          >
            <ProjectShowcase transition={transition} />
          </Section>

          <Section
            eyebrow="Live Builds"
            title="Live Preview"
            description="Interactive windows into deployed work, with quick project context and direct launch links."
          >
            <LiveProjectPreview transition={transition} />
          </Section>

          <Section
            eyebrow="Technical Expertise"
            title="Skills & Technologies"
            description="Comfortable across programming, frontend development, AI workflows, automation, and shipping tools."
          >
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3"
            >
              {skills.map((skill) => (
                <motion.span
                  key={skill}
                  variants={fadeUp}
                  transition={transition}
                  whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.04 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  className="rounded-full border border-border/80 bg-muted/40 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-xl transition hover:border-primary/40 hover:bg-primary/10"
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>
          </Section>

          <Section
            eyebrow="Career Journey"
            title="Experience"
            description="Professional experience building practical solutions and learning fast through real projects."
            muted
          >
            <div className="mx-auto max-w-4xl space-y-6">
              {experiences.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={shouldReduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -34 : 34 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                  transition={transition}
                  viewport={{ once: true, margin: '-80px' }}
                >
                  <TimelineItem item={item} />
                </motion.div>
              ))}
            </div>
          </Section>

          <Section
            eyebrow="Achievements"
            title="Hackathon Wins"
            description="Recognition for innovation, execution, and problem-solving in competitive environments."
          >
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
              {hackathons.map((hackathon) => (
                <HackathonCard key={`${hackathon.title}-${hackathon.event}`} hackathon={hackathon} />
              ))}
            </div>
          </Section>

          <Contact />
        </div>
      </main>
    </>
  )
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey)

  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function hasLivePreview(project: Project): project is LivePreviewProject {
  return Boolean(project.href)
}

function ThemeSwitchTransition({
  transitionState,
  onComplete,
}: {
  transitionState: ThemeTransitionState | null
  onComplete: (transitionId: number) => void
}) {
  const shouldReduceMotion = useReducedMotion()

  if (!transitionState || shouldReduceMotion) {
    return null
  }

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={transitionState.id}
        aria-hidden="true"
        data-reveal-theme={transitionState.from}
        className="theme-switch-reveal pointer-events-none fixed inset-0 z-[55] origin-top-right"
        initial={{ opacity: 1, scaleX: 1 }}
        animate={{ opacity: [1, 0.96, 0], scaleX: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          opacity: { duration: 0.5, times: [0, 0.72, 1], ease: 'easeOut' },
          scaleX: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
        }}
        onAnimationComplete={() => onComplete(transitionState.id)}
        style={{ willChange: 'opacity, transform' }}
      />
    </AnimatePresence>
  )
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const shouldReduceMotion = useReducedMotion()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const isLight = theme === 'light'
  const Icon = isLight ? Sun : Moon

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={isLight}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      initial={false}
      animate={{ '--toggle-glow-x': isLight ? '18%' : '82%' } as Record<string, string>}
      whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.03 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      transition={shouldReduceMotion ? instant : snappySpring}
      className="theme-toggle fixed right-4 top-4 z-[60] inline-flex h-11 w-20 cursor-pointer items-center rounded-full border border-border/70 bg-background/80 p-1 text-foreground shadow-lg shadow-black/10 backdrop-blur-xl transition hover:border-primary/60"
      style={{ willChange: shouldReduceMotion ? 'auto' : 'transform' }}
    >
      <span className="pointer-events-none absolute inset-1 rounded-full bg-muted/50" />
      <Sun className="pointer-events-none absolute left-3 h-4 w-4 text-primary" aria-hidden="true" />
      <Moon className="pointer-events-none absolute right-3 h-4 w-4 text-primary" aria-hidden="true" />
      <motion.span
        className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
        initial={false}
        animate={{
          x: isLight ? 0 : 36,
          rotate: shouldReduceMotion ? 0 : isLight ? 0 : 180,
        }}
        transition={shouldReduceMotion ? instant : themeToggleSpring}
        style={{ willChange: shouldReduceMotion ? 'auto' : 'transform' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.55, rotate: isLight ? -45 : 45 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.55, rotate: isLight ? 45 : -45 }}
            transition={shouldReduceMotion ? instant : { duration: 0.18, ease: 'easeOut' }}
            className="flex items-center justify-center"
            style={{ willChange: shouldReduceMotion ? 'auto' : 'opacity, transform' }}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </motion.span>
        </AnimatePresence>
      </motion.span>
      <AnimatePresence initial={false}>
        {!shouldReduceMotion ? (
          <motion.span
            key={theme}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border border-primary/30"
            initial={{ opacity: 0.45, scale: 0.82 }}
            animate={{ opacity: 0, scale: 1.28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.34, ease: 'easeOut' }}
            style={{ willChange: 'opacity, transform' }}
          />
        ) : null}
      </AnimatePresence>
      <span className="sr-only">Switch to {nextTheme} mode</span>
    </motion.button>
  )
}

function ScrollProgress() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 28, restDelta: 0.001 })

  if (shouldReduceMotion) {
    return null
  }

  return (
    <motion.div
      className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-primary shadow-[0_0_28px_rgba(255,255,255,0.45)]"
      style={{ scaleX, willChange: 'transform' }}
    />
  )
}

function ShootingStars() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-80"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,var(--shooting-star-haze),transparent_24rem)]" />
      {shootingStars.map((star) => {
        const starStyle = {
          top: star.top,
          left: star.left,
          width: star.width,
          rotate: '-28deg',
          willChange: shouldReduceMotion ? 'auto' : 'transform, opacity',
        } satisfies CSSProperties

        if (shouldReduceMotion) {
          return (
            <span
              key={star.id}
              className="shooting-star"
              style={{
                ...starStyle,
                opacity: 0.18,
                transform: 'translate3d(0, 0, 0)',
              }}
            />
          )
        }

        return (
          <motion.span
            key={star.id}
            className="shooting-star"
            initial={{ x: 0, y: 0, opacity: 0, scaleX: 0.35 }}
            animate={{
              x: -star.travel,
              y: star.travel * 0.44,
              opacity: [0, 0.72, 0],
              scaleX: [0.35, 1, 0.55],
            }}
            transition={{
              delay: star.delay,
              duration: star.duration,
              ease: [0.16, 1, 0.3, 1],
              repeat: Infinity,
              repeatDelay: star.repeatDelay,
            }}
            style={starStyle}
          />
        )
      })}
    </div>
  )
}

function useResponsiveSplineReady() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const win = window as IdleWindow
    let timer: number | undefined
    let idleId: number | undefined

    const cancelPending = () => {
      window.clearTimeout(timer)

      if (idleId !== undefined) {
        win.cancelIdleCallback?.(idleId)
        idleId = undefined
      }
    }

    const schedule = () => {
      cancelPending()

      const revealSpline = () => {
        idleId = undefined
        setIsReady(true)
      }

      if (win.requestIdleCallback) {
        idleId = win.requestIdleCallback(revealSpline, { timeout: 900 })
        return
      }

      timer = window.setTimeout(revealSpline, 450)
    }

    schedule()

    return () => {
      cancelPending()
    }
  }, [])

  return isReady
}

function SplinePlaceholder() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-white/8 via-white/[0.03] to-transparent">
      <motion.div
        className="absolute h-40 w-40 rounded-full border border-primary/10"
        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute h-24 w-24 rounded-full border border-primary/20"
        animate={shouldReduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      />
      <motion.img
        src={heroLayer}
        alt=""
        aria-hidden="true"
        className="relative z-10 w-40 max-w-[60%] drop-shadow-[0_24px_44px_rgba(0,0,0,0.45)] sm:w-48"
        animate={shouldReduceMotion ? undefined : { y: [-6, 6, -6], rotate: [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function Hero({
  transition,
  shouldReduceMotion,
}: {
  transition: Transition
  shouldReduceMotion: boolean
}) {
  const heroRef = useRef<HTMLElement>(null)
  const canLoadSpline = useResponsiveSplineReady()
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -76])
  const visualY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 110])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.78], [1, shouldReduceMotion ? 1 : 0.38])

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/40"
    >
      <HeroSpotlight />
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <motion.div
          className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
          animate={shouldReduceMotion ? undefined : { scale: [1, 1.07, 1], opacity: [0.2, 0.34, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          animate={shouldReduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.16, 0.3, 0.16] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-6 py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="order-2 space-y-6 lg:order-1 lg:space-y-8"
            style={{ y: textY, opacity: heroOpacity, willChange: 'transform, opacity' }}
          >
            <motion.div variants={fadeUp} transition={transition}>
              <Badge icon={Zap}>Available for Opportunities</Badge>
            </motion.div>

            <motion.div variants={fadeUp} transition={transition} className="space-y-4">
              <motion.h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-7xl" variants={container}>
                <motion.span variants={fadeUp} transition={transition} className="block text-muted-foreground">
                  Hi, I&apos;m
                </motion.span>
                <motion.span
                  variants={fadeUp}
                  transition={transition}
                  className="block bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent"
                >
                  Jaskaranveer Singh
                </motion.span>
              </motion.h1>
              <motion.p variants={fadeUp} transition={transition} className="text-xl font-light text-muted-foreground sm:text-2xl md:text-3xl">
                AI Developer & Creative Technologist
              </motion.p>
              <motion.p variants={fadeUp} transition={transition} className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                B.Tech Information Technology student, freelancer, and AI builder crafting practical
                digital experiences with modern web technologies and intelligent automation.
              </motion.p>
            </motion.div>

            <motion.div variants={fadeUp} transition={transition} className="flex flex-wrap gap-4">
              <ButtonLink href="#projects" variant="primary">
                View Projects
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ButtonLink>
              <ButtonLink href="mailto:jassie.08191@gmail.com" variant="secondary">
                <Mail className="mr-2 h-4 w-4" />
                Contact Me
              </ButtonLink>
            </motion.div>

            <motion.div variants={fadeUp} transition={transition} className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                aria-label={link.label}
                className="text-muted-foreground transition hover:text-primary"
              >
                  <motion.span
                    whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.12, rotate: -4 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
                    className="block"
                  >
                    <link.icon className="h-6 w-6" />
                  </motion.span>
                </a>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92, rotateY: -8 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1, rotateY: 0 }}
            transition={transition}
            className="order-1 relative h-[250px] sm:h-[340px] lg:order-2 lg:h-[600px]"
            style={{ y: visualY, willChange: 'transform, opacity' }}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.015, rotateX: 1.5, rotateY: -1.5 }}
          >
            <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent blur-3xl lg:inset-0" />
            <div
              role="img"
              aria-label="Interactive AI robot scene"
              className="relative h-full overflow-hidden rounded-3xl border border-border/70 bg-background/60 shadow-2xl shadow-black/40 backdrop-blur-xl lg:shadow-black/60"
            >
              {canLoadSpline ? (
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="h-full w-full"
                />
              ) : (
                <SplinePlaceholder />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ProjectShowcase({ transition }: { transition: Transition }) {
  return (
    <>
      <div className="lg:hidden">
        <ProjectShuffleDeck variant="mobile" transition={transition} />
      </div>
      <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="hidden lg:block">
        <motion.div variants={fadeUp} transition={transition}>
          <ProjectShuffleDeck variant="desktop" transition={transition} />
        </motion.div>
      </motion.div>
    </>
  )
}

function ProjectShuffleDeck({ variant, transition }: { variant: 'mobile' | 'desktop'; transition: Transition }) {
  const shouldReduceMotion = useReducedMotion()
  const [projectOrder, setProjectOrder] = useState(() => projects.map((_, index) => index))
  const totalProjects = projects.length
  const isDesktop = variant === 'desktop'
  const deckPoses = isDesktop ? desktopDeckPoses : mobileDeckPoses
  const visibleProjects = projectOrder.map((projectIndex, offset) => ({
    project: projects[projectIndex],
    offset,
  }))

  const showPrevious = useCallback(() => {
    setProjectOrder((current) => [current[current.length - 1], ...current.slice(0, -1)])
  }, [])

  const showNext = useCallback(() => {
    setProjectOrder((current) => [...current.slice(1), current[0]])
  }, [])

  const showProject = useCallback((projectIndex: number) => {
    setProjectOrder((current) => {
      const nextIndex = current.indexOf(projectIndex)

      if (nextIndex <= 0) {
        return current
      }

      return [...current.slice(nextIndex), ...current.slice(0, nextIndex)]
    })
  }, [])

  const shuffleProjects = useCallback(() => {
    setProjectOrder((current) => {
      const next = [...current]

      for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1))
        ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
      }

      if (next.length > 1 && next[0] === current[0]) {
        ;[next[0], next[1]] = [next[1], next[0]]
      }

      return next
    })
  }, [])

  const activeProjectIndex = projectOrder[0]
  const activeProject = projects[activeProjectIndex]

  return (
    <div>
      <div
        className={isDesktop ? 'relative mx-auto h-[430px] max-w-5xl' : 'relative mx-auto h-[360px] max-w-sm'}
        style={deckPerspectiveStyle}
      >
        {visibleProjects.map(({ project, offset }) => {
          const isActive = offset === 0
          const pose = deckPoses[offset] ?? hiddenDeckPose
          const zIndex = totalProjects - offset

          return (
            <motion.div
              key={project.title}
              className={`absolute inset-x-0 top-0 mx-auto w-full max-w-sm lg:max-w-[23.5rem] xl:max-w-[26rem] ${
                isActive ? '' : 'pointer-events-none'
              }`}
              aria-hidden={!isActive}
              initial={shouldReduceMotion ? false : { y: 42, scale: 0.9, rotate: 6, opacity: 0 }}
              animate={shouldReduceMotion ? { x: 0, y: offset * 10, opacity: isActive ? 1 : 0.2 } : pose}
              transition={shouldReduceMotion ? instant : transition}
              style={{
                zIndex,
                willChange: shouldReduceMotion ? 'auto' : 'transform, opacity',
              }}
            >
              <ProjectDeckCard project={project} isActive={isActive} isDesktop={isDesktop} />
            </motion.div>
          )
        })}
      </div>

      <div className="mx-auto mt-5 flex max-w-sm items-center justify-between gap-3 lg:max-w-md lg:justify-center">
        <motion.button
          type="button"
          aria-label="Previous project"
          onClick={showPrevious}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-background/70 text-foreground shadow-sm backdrop-blur transition hover:border-primary/50"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        <div className="flex items-center gap-2" aria-label={`Showing ${activeProject.title}`}>
          {projects.map((project, index) => (
            <button
              key={project.title}
              type="button"
              aria-label={`Show ${project.title}`}
              onClick={() => showProject(index)}
              className={`h-2.5 cursor-pointer rounded-full transition-all ${
                index === activeProjectIndex ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/35 hover:bg-muted-foreground/55'
              }`}
            />
          ))}
        </div>

        <motion.button
          type="button"
          aria-label="Next project"
          onClick={showNext}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-background/70 text-foreground shadow-sm backdrop-blur transition hover:border-primary/50"
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>

        <motion.button
          type="button"
          aria-label="Shuffle projects"
          onClick={shuffleProjects}
          whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.04 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
          transition={shouldReduceMotion ? instant : snappySpring}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-sm backdrop-blur transition hover:bg-primary/90"
          style={{ willChange: shouldReduceMotion ? 'auto' : 'transform' }}
        >
          <Shuffle className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  )
}

function ProjectDeckCard({
  project,
  isActive,
  isDesktop,
}: {
  project: Project
  isActive: boolean
  isDesktop: boolean
}) {
  const card = (
    <Card className="min-h-[320px] rounded-2xl border-border/60 bg-background/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl lg:min-h-[340px]">
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <CodeXml className="h-6 w-6" />
            </div>
            {project.href ? <ExternalLink className="h-5 w-5 text-muted-foreground" /> : null}
          </div>
          <div className="space-y-3">
            <h3 className={isDesktop ? 'text-3xl font-bold tracking-tight' : 'text-2xl font-bold tracking-tight'}>{project.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground lg:text-base">{project.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  )

  if (!project.href) {
    return card
  }

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${project.title}`}
      tabIndex={isActive ? undefined : -1}
      className="block rounded-2xl focus-visible:outline-none"
    >
      {card}
    </a>
  )
}

function LiveProjectPreview({ transition }: { transition: Transition }) {
  const shouldReduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [previewMode, setPreviewMode] = useState<LivePreviewMode>('desktop')
  const [loadedPreviewKey, setLoadedPreviewKey] = useState<string | null>(null)
  const activeProject = livePreviewProjects[activeIndex] ?? livePreviewProjects[0]
  const modeControls: Array<{
    mode: LivePreviewMode
    label: string
    icon: ComponentType<{ className?: string }>
  }> = [
    { mode: 'desktop', label: 'Desktop preview', icon: Monitor },
    { mode: 'mobile', label: 'Mobile preview', icon: Smartphone },
  ]

  if (!activeProject) {
    return null
  }

  const previewKey = `${activeProject.href}-${previewMode}`
  const canEmbedPreview = activeProject.embedPreview !== false
  const isLoading = canEmbedPreview && loadedPreviewKey !== previewKey

  return (
    <div className="relative isolate w-full">
      {/* Ambient glowing orbs for Live Preview section */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-[30rem] w-[30rem] rounded-full bg-violet-500/10 blur-[120px]" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start relative z-10"
      >
        {/* Info Panel */}
        <motion.div variants={fadeUp} transition={transition}>
          <div className="live-preview-panel rounded-3xl p-[1px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent shadow-xl">
            <Card className="rounded-3xl border border-border/50 bg-background/60 p-0 shadow-2xl shadow-primary/5 backdrop-blur-2xl">
            <div className="p-5 md:p-6">
              <div className="space-y-6">
                {/* Project Header */}
                <div className="flex items-start gap-4">
                  <motion.div
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20"
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.08, rotate: -4 }}
                    transition={shouldReduceMotion ? instant : snappySpring}
                  >
                    <Play className="h-6 w-6" />
                  </motion.div>
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold tracking-tight">{activeProject.title}</h3>
                      <span className="live-status-dot inline-block h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" />
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{activeProject.description}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {activeProject.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold tracking-wide text-primary ring-1 ring-primary/15">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* Project Selector */}
                <div className="space-y-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-muted-foreground/70">Select Project</p>
                  <div className="grid gap-2">
                    {livePreviewProjects.map((project, index) => {
                      const isSelected = index === activeIndex

                      return (
                        <motion.button
                          key={project.title}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setActiveIndex(index)}
                          whileHover={shouldReduceMotion ? undefined : { x: 4, scale: 1.01 }}
                          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                          transition={shouldReduceMotion ? instant : snappySpring}
                          className={`live-preview-project-btn flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-300 ${
                            isSelected
                              ? 'border-primary/40 bg-gradient-to-r from-primary/20 to-primary/5 text-foreground shadow-[0_0_20px_rgba(var(--primary),0.15)] scale-[1.02]'
                              : 'border-border/40 bg-muted/20 text-foreground hover:border-primary/30 hover:bg-primary/10 hover:shadow-md hover:translate-x-1'
                          }`}
                          style={{ willChange: shouldReduceMotion ? 'auto' : 'transform' }}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                              isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                            }`}>
                              {index + 1}
                            </span>
                            <span>{project.title}</span>
                          </div>
                          <ExternalLink className={`h-4 w-4 flex-shrink-0 transition ${isSelected ? 'opacity-70' : 'opacity-40'}`} aria-hidden="true" />
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* Controls */}
                <div className="flex items-center justify-between gap-3">
                  {canEmbedPreview ? (
                    <div className="inline-flex rounded-full border border-border/60 bg-muted/20 p-1 shadow-inner">
                      {modeControls.map(({ mode, label, icon: Icon }) => {
                        const isSelected = previewMode === mode

                        return (
                          <motion.button
                            key={mode}
                            type="button"
                            aria-label={label}
                            aria-pressed={isSelected}
                            title={label}
                            onClick={() => setPreviewMode(mode)}
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
                            transition={shouldReduceMotion ? instant : snappySpring}
                            className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all ${
                              isSelected ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </motion.button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border/50 bg-muted/20 px-4 text-sm font-medium text-muted-foreground">
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      External only
                    </div>
                  )}

                  <ButtonLink href={activeProject.href} variant="secondary" external>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Site
                  </ButtonLink>
                </div>

                {/* WhatsApp CTA */}
                <motion.a
                  href="https://wa.me/9781010283"
                  target="_blank"
                  rel="noreferrer"
                  whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                  transition={shouldReduceMotion ? instant : snappySpring}
                  className="live-preview-whatsapp flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/20 transition-all hover:bg-[#22c55e] hover:shadow-xl hover:shadow-[#25D366]/30"
                  style={{ willChange: shouldReduceMotion ? 'auto' : 'transform' }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Want something similar? Chat on WhatsApp
                </motion.a>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Browser Preview */}
      <motion.div variants={fadeUp} transition={transition} className="min-w-0">
        <div className="live-preview-browser-wrap rounded-[22px] p-[1px] bg-gradient-to-br from-primary/30 via-border/10 to-border/30 shadow-2xl">
          <div
            className={`relative mx-auto overflow-hidden bg-background/95 backdrop-blur-3xl shadow-[0_0_40px_rgba(0,0,0,0.3)] ${
              previewMode === 'desktop' ? 'h-[460px] w-full rounded-[20px] lg:h-[520px]' : 'h-[620px] w-full max-w-[360px] rounded-[2rem]'
            }`}
          >
            {/* Enhanced Browser Chrome */}
            <div className="flex h-12 items-center justify-between border-b border-border/40 bg-gradient-to-b from-muted/80 to-muted/30 px-4 backdrop-blur-md">
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-[#FF5F56] shadow-inner border border-[#E0443E]/50" />
                <span className="h-3 w-3 rounded-full bg-[#FFBD2E] shadow-inner border border-[#DEA123]/50" />
                <span className="h-3 w-3 rounded-full bg-[#27C93F] shadow-inner border border-[#1AAB29]/50" />
              </div>
              <div className="mx-4 flex flex-1 max-w-sm items-center gap-2 rounded-md border border-border/50 bg-background/60 px-3 py-1.5 shadow-sm backdrop-blur-lg">
                <span className="live-status-dot inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <p className="truncate text-[0.75rem] font-medium text-muted-foreground">{activeProject.href}</p>
              </div>
              <Monitor className="h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
            </div>

            {/* Preview Content */}
            <div className="relative h-[calc(100%-2.75rem)] bg-background">
              <AnimatePresence mode="wait">
                {canEmbedPreview ? (
                  <motion.iframe
                    key={previewKey}
                    title={`${activeProject.title} live preview`}
                    src={activeProject.href}
                    loading="lazy"
                    sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    referrerPolicy="no-referrer"
                    onLoad={() => setLoadedPreviewKey(previewKey)}
                    className="h-full w-full border-0 bg-background"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                    transition={shouldReduceMotion ? instant : { duration: 0.28, ease: 'easeOut' }}
                    style={{ willChange: shouldReduceMotion ? 'auto' : 'opacity, transform' }}
                  />
                ) : (
                  <motion.div
                    key={`external-${activeProject.href}`}
                    className="flex h-full items-center justify-center bg-gradient-to-br from-muted/30 via-background to-background p-6 text-center"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                    transition={shouldReduceMotion ? instant : { duration: 0.28, ease: 'easeOut' }}
                    style={{ willChange: shouldReduceMotion ? 'auto' : 'opacity, transform' }}
                  >
                    <div className="mx-auto max-w-md space-y-6">
                      <motion.div
                        className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-2xl shadow-primary/20"
                        animate={shouldReduceMotion ? undefined : { y: [-4, 4, -4] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ExternalLink className="h-8 w-8" aria-hidden="true" />
                      </motion.div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight">Open {activeProject.title}</h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                          This deployment uses security headers that keep it outside embedded frames.
                        </p>
                      </div>
                      <ButtonLink href={activeProject.href} variant="primary" external>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Live Site
                      </ButtonLink>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isLoading ? (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={shouldReduceMotion ? instant : { duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3 rounded-full border border-border/60 bg-background/95 px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-xl backdrop-blur-xl">
                      <motion.span
                        className="inline-block"
                        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Play className="h-4 w-4 text-primary" aria-hidden="true" />
                      </motion.span>
                      Loading preview…
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
    </div>
  )
}

function Section({
  eyebrow,
  title,
  description,
  children,
  muted = false,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  muted?: boolean
}) {
  const shouldReduceMotion = useReducedMotion()
  const transition = shouldReduceMotion ? instant : spring
  const sectionId = title === 'Projects' ? 'projects' : title === 'Live Preview' ? 'live-preview' : undefined
  const BadgeIcon =
    title === 'Projects' ? Rocket : title === 'Live Preview' ? Monitor : title === 'Experience' ? Briefcase : title === 'Hackathon Wins' ? Trophy : CodeXml

  return (
    <section
      id={sectionId}
      className={`content-section px-6 py-24 ${muted ? 'bg-muted/30' : ''}`}
    >
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="mb-16 text-center"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <Badge icon={BadgeIcon}>{eyebrow}</Badge>
          <motion.h2 variants={fadeUp} transition={transition} className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            {title}
          </motion.h2>
          <motion.p variants={fadeUp} transition={transition} className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {description}
          </motion.p>
        </motion.div>
        {children}
      </div>
    </section>
  )
}

function TimelineItem({ item }: { item: Experience }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.01 }}
      transition={snappySpring}
      className="relative rounded-xl border border-border/50 bg-background/50 p-6 shadow-sm backdrop-blur-xl"
      style={{ willChange: shouldReduceMotion ? 'auto' : 'transform' }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="flex-grow">
          <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{item.period}</span>
          </div>
          <p className="mb-3 font-medium text-muted-foreground">{item.org}</p>
          <p className="leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
      </div>
    </motion.div>
  )
}

function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.015 }}
      transition={spring}
      viewport={{ once: true, margin: '-80px' }}
      style={{ willChange: shouldReduceMotion ? 'auto' : 'transform, opacity' }}
    >
      <Card className="rounded-xl border-border/50 bg-background/50 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-white/10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold">{hackathon.title}</h3>
              <p className="font-medium text-primary">{hackathon.event}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              {hackathon.year}
            </div>
            <p className="leading-relaxed text-muted-foreground">{hackathon.description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function Contact() {
  const shouldReduceMotion = useReducedMotion()
  const [formState, setFormState] = useState({ name: '', email: '', subject: 'Website Development', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formError, setFormError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
      setFormError('Please fill in all required fields.')
      return
    }
    setFormError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          // IMPORTANT: Replace this with your actual Web3Forms access key from https://web3forms.com/
          access_key: '759c7d9e-a638-4f93-9277-c26499e40274',
          name: formState.name,
          email: formState.email,
          subject: formState.subject,
          message: formState.message,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setIsSubmitted(true)
      } else {
        setFormError(result.message || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setFormError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="content-section bg-gradient-to-br from-primary/5 via-background to-background px-6 py-24 relative overflow-hidden">
      {/* Background glowing blur elements */}
      <div className="pointer-events-none absolute -bottom-36 -right-36 h-96 w-96 rounded-full bg-[#25D366]/5 blur-[128px]" />
      <div className="pointer-events-none absolute -top-36 -left-36 h-96 w-96 rounded-full bg-primary/5 blur-[128px]" />

      <motion.div
        className="container mx-auto max-w-6xl relative z-10"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="text-center mb-16">
          <Badge icon={Zap}>Open to Opportunities</Badge>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Let&apos;s Build Something Great
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Have an idea, project, or role? Drop a message or reach out directly on WhatsApp. I usually reply within a few hours.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-stretch text-left">
          {/* Left Column: Direct Contacts */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="space-y-6">
              {/* WhatsApp Card */}
              <motion.a
                href="https://wa.me/9781010283?text=Hi%20Jaskaranveer,%20I%20saw%20your%20portfolio%20and%20would%20love%20to%20chat!"
                target="_blank"
                rel="noreferrer"
                whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="group block relative rounded-2xl border border-border/60 bg-muted/20 p-6 shadow-sm backdrop-blur-xl transition hover:border-[#25D366]/40 hover:bg-[#25D366]/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] transition group-hover:bg-[#25D366]/20">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-[#25D366] transition">WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">+91 97810 10283</p>
                    </div>
                  </div>
                  <span className="flex h-3.5 w-3.5 items-center justify-center relative">
                    <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-[#25D366] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Quickest way to chat. Ideal for instant questions, project scopes, or quick call coordination.
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity">
                  Chat Now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </motion.a>

              {/* Email Card */}
              <motion.a
                href="mailto:jassie.08191@gmail.com"
                whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="group block relative rounded-2xl border border-border/60 bg-muted/20 p-6 shadow-sm backdrop-blur-xl transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-foreground transition group-hover:bg-primary/10">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition">Email Address</h3>
                      <p className="text-sm text-muted-foreground">jassie.08191@gmail.com</p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  For formal requests, detailed RFPs, or job discussions. Checked daily.
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Send Email <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </motion.a>

              {/* GitHub Card */}
              <motion.a
                href="https://github.com/Jassie-Dot"
                target="_blank"
                rel="noreferrer"
                whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="group block relative rounded-2xl border border-border/60 bg-muted/20 p-6 shadow-sm backdrop-blur-xl transition hover:border-violet-500/40 hover:bg-violet-500/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 transition group-hover:bg-violet-500/20">
                      <GitBranch className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-violet-400 transition">GitHub Profile</h3>
                      <p className="text-sm text-muted-foreground">github.com/Jassie-Dot</p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Explore open source work, system experiments, and source codes directly.
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore Repos <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </motion.a>
            </div>

            <p className="hidden lg:block text-xs text-muted-foreground mt-8">
              &copy; 2026 Jaskaranveer Singh. All rights reserved. Made with precision and passion.
            </p>
          </div>

          {/* Right Column: Custom Glassmorphic Form */}
          <div className="lg:col-span-7">
            <Card className="h-full border border-border/60 bg-muted/20 backdrop-blur-xl relative overflow-hidden flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    className="p-8 space-y-6 flex flex-col h-full justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold tracking-tight text-foreground">Send a Direct Message</h3>
                      <p className="text-sm text-muted-foreground">
                        Fill in details below and I&apos;ll get back to you by email.
                      </p>

                      {formError && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                          {formError}
                        </div>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5 text-left">
                          <label htmlFor="name" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formState.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full rounded-lg border border-border/60 bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition focus:border-primary focus:bg-background/80"
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label htmlFor="email" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formState.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className="w-full rounded-lg border border-border/60 bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition focus:border-primary focus:bg-background/80"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label htmlFor="subject" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                          Project/Subject *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formState.subject}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-border/60 bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:bg-background/80 appearance-none cursor-pointer"
                          style={{
                            backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M19 9l-7 7-7-7' stroke-linecap='round' stroke-linejoin='round'></path></svg>")`,
                            backgroundPosition: 'right 1rem center',
                            backgroundSize: '1em',
                            backgroundRepeat: 'no-repeat',
                          }}
                        >
                          <option value="Website Development" className="bg-background">Website Development</option>
                          <option value="Website Redesign" className="bg-background">Website Redesign</option>
                          <option value="E-Commerce Site" className="bg-background">E-Commerce Site</option>
                          <option value="Landing Page" className="bg-background">Landing Page</option>
                          <option value="Website Maintenance" className="bg-background">Website Maintenance</option>
                          <option value="General Inquiry" className="bg-background">General Inquiry</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label htmlFor="message" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          value={formState.message}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Tell me about your project, goals, or schedule..."
                          className="w-full rounded-lg border border-border/60 bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition focus:border-primary focus:bg-background/80 resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-6 w-full flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-card"
                    className="p-8 text-center flex flex-col items-center justify-center h-full min-h-[380px] space-y-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-inner">
                      <Check className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold tracking-tight text-foreground">Message Sent Successfully!</h3>
                      <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                        Thank you for reaching out, {formState.name}! I have received your request regarding a <strong>{formState.subject}</strong> project.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-4 max-w-md w-full text-left text-xs text-muted-foreground leading-relaxed">
                      <strong>Your message summary:</strong>
                      <p className="mt-1 line-clamp-3 italic text-foreground/80">&ldquo;{formState.message}&rdquo;</p>
                    </div>
                      <button
                        onClick={() => {
                          setIsSubmitted(false)
                          setFormState({ name: '', email: '', subject: 'Website Development', message: '' })
                        }}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-semibold text-foreground shadow-sm hover:bg-muted transition cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>

        <p className="lg:hidden text-center text-xs text-muted-foreground mt-12">
          &copy; 2026 Jaskaranveer Singh. All rights reserved. Made with precision and passion.
        </p>
      </motion.div>
    </section>
  )
}

function Badge({ children, icon: Icon }: { children: ReactNode; icon: ComponentType<{ className?: string }> }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
      transition={snappySpring}
      className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
      style={{ willChange: shouldReduceMotion ? 'auto' : 'transform' }}
    >
      <Icon className="mr-2 inline h-3 w-3" />
      {children}
    </motion.div>
  )
}

function ButtonLink({
  href,
  children,
  variant,
  external = false,
}: {
  href: string
  children: ReactNode
  variant: 'primary' | 'secondary'
  external?: boolean
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.035 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      transition={snappySpring}
      className={`group inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-all duration-200 ${
        variant === 'primary'
          ? 'bg-primary text-primary-foreground shadow-lg shadow-white/10 hover:bg-primary/90'
          : 'border border-border bg-muted/30 text-foreground shadow-sm hover:bg-muted'
      }`}
      style={{ willChange: shouldReduceMotion ? 'auto' : 'transform' }}
    >
      {children}
    </motion.a>
  )
}

function HeroSpotlight() {
  return (
    <svg
      className="animate-spotlight pointer-events-none absolute -top-40 left-0 h-[169%] w-[138%] opacity-0 md:left-60 md:-top-20 lg:w-[84%]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
      aria-hidden="true"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill="white"
          fillOpacity="0.08"
        />
      </g>
      <defs>
        <filter id="filter" x="0.860352" y="0.838989" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
        </filter>
      </defs>
    </svg>
  )
}

export default App
