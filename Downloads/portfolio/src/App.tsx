import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type PointerEvent,
  type ReactNode,
} from 'react'
import {
  ArrowRight,
  Award,
  Briefcase,
  CodeXml,
  ExternalLink,
  GitBranch,
  Mail,
  Rocket,
  Trophy,
  Zap,
} from 'lucide-react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Transition,
} from 'motion/react'

import './App.css'
import { Card } from '@/components/ui/card'
import { SplineScene } from '@/components/ui/splite'

type Project = {
  title: string
  description: string
  tags: string[]
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

const projects: Project[] = [
  {
    title: 'Sentinel Pro AI',
    description:
      'Self-evolving AI platform concept with modular plugin architecture, adaptability, automation, and intelligent decision-making.',
    tags: ['AI', 'Automation', 'Architecture'],
  },
  {
    title: 'Jarvis AI',
    description:
      'AI assistant project focused on useful daily workflows, command handling, productivity support, and smart automation.',
    tags: ['Assistant', 'Python', 'AI'],
  },
  {
    title: 'Helix AI',
    description:
      'Modern AI application experiment exploring practical intelligence, fast prototyping, and responsive user interaction.',
    tags: ['AI Apps', 'Frontend', 'Prototype'],
  },
  {
    title: 'AI-Based Development Projects',
    description:
      'Multiple AI-powered applications and automation tools built to solve real workflow problems and improve productivity.',
    tags: ['Prompting', 'Tools', 'Systems'],
  },
  {
    title: 'Responsive Web Projects',
    description:
      'Modern responsive websites using HTML, CSS, and JavaScript with a focus on usability, speed, and clean interfaces.',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
  },
  {
    title: 'Freelance Client Builds',
    description:
      'Client-facing digital projects delivered with requirement gathering, communication, project timelines, and real-world polish.',
    tags: ['Freelance', 'Delivery', 'Web'],
  },
]

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
    org: 'Sentinel Pro AI, Jarvis AI, Helix AI',
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
const cardGlow = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
}
const tiltSpring = { stiffness: 260, damping: 30, mass: 0.45 }

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
    cancelIdleCallback?: (handle: number) => void
  }

function App() {
  const shouldReduceMotion = useReducedMotion()
  const transition = shouldReduceMotion ? instant : spring

  return (
    <>
      <ScrollProgress />
      <main className="min-h-screen w-full overflow-hidden bg-background text-foreground">
        <Hero transition={transition} shouldReduceMotion={Boolean(shouldReduceMotion)} />

        <Section
          eyebrow="Featured Work"
          title="Projects"
          description="A selection of my recent work showcasing AI systems, web development, and real-world delivery."
          muted
        >
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {projects.map((project) => (
              <motion.div key={project.title} variants={fadeUp} transition={transition}>
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
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
      </main>
    </>
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

function useDesktopSplineReady() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const win = window as IdleWindow
    const media = window.matchMedia('(min-width: 1024px)')
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

      if (!media.matches) {
        setIsReady(false)
        return
      }

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
    media.addEventListener('change', schedule)

    return () => {
      cancelPending()
      media.removeEventListener('change', schedule)
    }
  }, [])

  return isReady
}

function SplinePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/8 via-white/[0.03] to-transparent">
      <div className="h-16 w-16 rounded-full border border-white/15 border-t-white/70" />
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
  const canLoadSpline = useDesktopSplineReady()
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
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="space-y-8"
            style={{ y: textY, opacity: heroOpacity, willChange: 'transform, opacity' }}
          >
            <motion.div variants={fadeUp} transition={transition}>
              <Badge icon={Zap}>Available for Opportunities</Badge>
            </motion.div>

            <motion.div variants={fadeUp} transition={transition} className="space-y-4">
              <motion.h1 className="text-5xl font-black tracking-tight md:text-7xl" variants={container}>
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
              <motion.p variants={fadeUp} transition={transition} className="text-2xl font-light text-muted-foreground md:text-3xl">
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
            className="relative hidden h-[600px] lg:block"
            style={{ y: visualY, willChange: 'transform, opacity' }}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.015, rotateX: 1.5, rotateY: -1.5 }}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
            <div className="relative h-full overflow-hidden rounded-3xl border border-border/70 bg-background/60 shadow-2xl shadow-black/60 backdrop-blur-xl">
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

  return (
    <section
      id={title === 'Projects' ? 'projects' : undefined}
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
          <Badge icon={title === 'Projects' ? Rocket : title === 'Experience' ? Briefcase : title === 'Hackathon Wins' ? Trophy : CodeXml}>
            {eyebrow}
          </Badge>
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

function ProjectCard({ project }: { project: Project }) {
  const shouldReduceMotion = useReducedMotion()
  const boundsRef = useRef<DOMRect | null>(null)
  const pointerStateRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null)
  const frameRef = useRef<number | null>(null)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const glowX = useMotionValue(0)
  const glowY = useMotionValue(0)
  const smoothTiltX = useSpring(tiltX, tiltSpring)
  const smoothTiltY = useSpring(tiltY, tiltSpring)
  const rotateX = useTransform(smoothTiltY, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(smoothTiltX, [-0.5, 0.5], [-8, 8])
  const glowBackground = useMotionTemplate`radial-gradient(420px circle at ${glowX}px ${glowY}px, rgba(255,255,255,0.18), transparent 42%)`

  const flushPointerFrame = useCallback(() => {
    const pointer = pointerStateRef.current
    frameRef.current = null

    if (!pointer) {
      return
    }

    glowX.set(pointer.x)
    glowY.set(pointer.y)
    tiltX.set(pointer.x / pointer.width - 0.5)
    tiltY.set(pointer.y / pointer.height - 0.5)
  }, [glowX, glowY, tiltX, tiltY])

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  const handlePointerEnter = useCallback((event: PointerEvent<HTMLDivElement>) => {
    boundsRef.current = event.currentTarget.getBoundingClientRect()
  }, [])

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) {
      return
    }

    const bounds = boundsRef.current ?? event.currentTarget.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top

    pointerStateRef.current = {
      x,
      y,
      width: Math.max(bounds.width, 1),
      height: Math.max(bounds.height, 1),
    }

    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(flushPointerFrame)
    }
  }, [flushPointerFrame, shouldReduceMotion])

  const handlePointerLeave = useCallback(() => {
    boundsRef.current = null
    pointerStateRef.current = null

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    tiltX.set(0)
    tiltY.set(0)
  }, [tiltX, tiltY])

  return (
    <motion.div
      className="group h-full [perspective:1000px]"
      initial="rest"
      whileHover="hover"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        rotateX: shouldReduceMotion ? 0 : rotateX,
        rotateY: shouldReduceMotion ? 0 : rotateY,
        transformStyle: 'preserve-3d',
        willChange: shouldReduceMotion ? 'auto' : 'transform',
      }}
      transition={snappySpring}
    >
      <Card className="relative h-full overflow-hidden rounded-xl border-border/50 bg-background/50 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-2xl group-hover:shadow-white/10">
        <motion.div className="pointer-events-none absolute inset-0" variants={cardGlow} style={{ background: glowBackground }} />
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"
          variants={cardGlow}
        />
        <div className="relative z-10 space-y-4 [transform:translateZ(26px)]">
          <div className="flex items-start justify-between">
            <motion.div variants={cardGlow}>
              <CodeXml className="h-8 w-8 text-primary" />
            </motion.div>
            <motion.div variants={{ rest: { x: 0, y: 0 }, hover: { x: 4, y: -4 } }} transition={snappySpring}>
              <ExternalLink className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
            </motion.div>
          </div>
          <h3 className="text-xl font-semibold">{project.title}</h3>
          <p className="leading-relaxed text-muted-foreground">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <motion.span
                key={tag}
                variants={{ rest: { y: 0 }, hover: { y: -2 } }}
                transition={snappySpring}
                className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
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

  return (
    <section className="content-section bg-gradient-to-br from-primary/10 via-background to-background px-6 py-24">
      <motion.div
        className="container mx-auto max-w-4xl text-center"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={spring}
        viewport={{ once: true, margin: '-100px' }}
      >
        <Badge icon={Zap}>Open to Opportunities</Badge>
        <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Let&apos;s Work Together</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Available for freelance projects, part-time roles, and exciting collaborations. Let&apos;s build something
          meaningful with AI, automation, and modern web technology.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink href="mailto:jassie.08191@gmail.com" variant="primary">
            <Mail className="mr-2 h-4 w-4" />
            Get in Touch
          </ButtonLink>
          <ButtonLink href="https://github.com/Jassie-Dot" variant="secondary" external>
            <GitBranch className="mr-2 h-4 w-4" />
            View GitHub
          </ButtonLink>
        </div>
        <p className="mt-12 text-sm text-muted-foreground">© 2026 Jaskaranveer Singh. All rights reserved.</p>
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
