import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  type SVGProps,
} from 'react'
import { animate } from 'animejs'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Transition,
} from 'motion/react'
import {
  ArrowRight,
  ArrowUp,
  Check,
  Code2,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  Menu,
  Phone,
  Send,
  Smartphone,
  Sparkles,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85'
const BG_IMAGE_2 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85'

const SPOTLIGHT_R = 260
const TRANSPARENT_MASK = 'linear-gradient(transparent, transparent)'
const contactEmail = 'thecodeforgee@gmail.com'
const contactPhones = ['+91 9781010283', '+91 6280962201']
const jaskaranPortfolio = 'https://jaskaranveerportfolio.vercel.app/'
const manijitPortfolio = 'https://manijitportfolio.vercel.app/'

type NavItem = {
  label: string
  target: string
}

type Service = {
  title: string
  description: string
  icon: LucideIcon
}

type Work = {
  title: string
  description: string
  href: string
  image: string
  tags: string[]
}

type Founder = {
  name: string
  role: string
  description: string
  portfolio: string
  image: string
  imageClass: string
}

type FloatingContact = {
  name: string
  role: string
  href: string
  image: string
  imageClass: string
}

const navItems: NavItem[] = [
  { label: 'Services', target: 'services' },
  { label: 'Work', target: 'portfolio' },
  { label: 'Process', target: 'process' },
  { label: 'Team', target: 'team' },
  { label: 'Contact', target: 'contact' },
]

const services: Service[] = [
  {
    title: 'Web Development',
    description:
      'Custom websites, landing pages, and business platforms built for clarity and performance.',
    icon: Code2,
  },
  {
    title: 'Web Applications',
    description:
      'Dashboards, admin panels, SaaS interfaces, and internal tools with clean user flows.',
    icon: Smartphone,
  },
  {
    title: 'Digital Strategy',
    description:
      'Conversion-focused structure, content planning, SEO foundations, and launch direction.',
    icon: Globe2,
  },
  {
    title: 'Performance Optimization',
    description:
      'Lightning-fast experiences optimized for speed, mobile usability, SEO, and reliability.',
    icon: Zap,
  },
]

const works: Work[] = [
  {
    title: 'Jaskaranveer Portfolio',
    description:
      'A comprehensive showcase of technical expertise, featuring responsive web applications, modern interfaces, and scalable full-stack solutions.',
    href: jaskaranPortfolio,
    image: '/jaskaran-portfolio-hero.png',
    tags: ['Full Stack Developer', 'Web Developer'],
  },
  {
    title: 'Manijit Portfolio',
    description:
      'A comprehensive showcase of technical expertise, featuring responsive web applications, modern interfaces, and scalable full-stack solutions.',
    href: manijitPortfolio,
    image: '/manijit-portfolio-hero.png',
    tags: ['Full Stack Developer', 'Web Developer'],
  },
]

const founders: Founder[] = [
  {
    name: 'Jaskaranveer Singh',
    role: 'Co-Founder & Full Stack Developer',
    description:
      'Full-stack developer focused on backend technologies, building premium web applications and scalable digital solutions.',
    portfolio: jaskaranPortfolio,
    image: '/jaskaran-cropped.jpg',
    imageClass: 'object-[center_30%] scale-[1.35]',
  },
  {
    name: 'Manijit Sau',
    role: 'Co-Founder & Full Stack Developer',
    description:
      'Full-stack developer focused on frontend technologies, building premium web applications and scalable digital solutions.',
    portfolio: manijitPortfolio,
    image: '/manijit.jpg',
    imageClass: 'object-[center_20%] scale-[1.45]',
  },
]

const processSteps = [
  {
    title: 'Map the ground',
    copy: 'We clarify goals, audience, required pages, and conversion moments before any visual work starts.',
  },
  {
    title: 'Shape the interface',
    copy: 'Layouts, content flow, and interaction states are designed around the work your visitors came to do.',
  },
  {
    title: 'Forge the build',
    copy: 'The site or web app is built with responsive React, clean components, and practical performance choices.',
  },
  {
    title: 'Launch and tune',
    copy: 'We check speed, mobile behavior, SEO basics, and handoff details so the product is ready to use.',
  },
]

const floatingContacts: FloatingContact[] = [
  {
    name: 'Manijit Sau',
    role: 'Full Stack Developer',
    href: 'https://wa.me/916280967201',
    image: '/manijit.jpg',
    imageClass: 'object-[center_20%] scale-[1.45]',
  },
  {
    name: 'Jaskaranveer Singh',
    role: 'Full Stack Developer',
    href: 'https://wa.me/919781010283',
    image: '/jaskaran-cropped.jpg',
    imageClass: 'object-[center_30%] scale-[1.35]',
  },
]

const spring: Transition = { type: 'spring', stiffness: 260, damping: 32, mass: 0.82 }
const floatSpring: Transition = { type: 'spring', stiffness: 420, damping: 34, mass: 0.62 }
const pageEase = [0.16, 1, 0.3, 1] as const
const revealStyle: CSSProperties = { willChange: 'opacity, transform' }
const progressStyle: CSSProperties = { transformOrigin: '0% 50%' }

function App() {
  const { scrollYProgress } = useScroll()
  const shouldReduceMotion = useReducedMotion()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [composeUrl, setComposeUrl] = useState('')

  const scrollToSection = useCallback(
    (target: string) => {
      setMobileOpen(false)
      document.getElementById(target)?.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    },
    [shouldReduceMotion],
  )

  const scrollToTop = useCallback(() => {
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' })
  }, [shouldReduceMotion])

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 560
      setShowScrollTop((visible) => (visible === shouldShow ? visible : shouldShow))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()
    const subject = `New project request from ${name || 'CodeForge website'}`
    const body = [
      `Name: ${name || 'Not provided'}`,
      `Email: ${email || 'Not provided'}`,
      `Phone: ${phone || 'Not provided'}`,
      '',
      'Message:',
      message || 'Not provided',
    ].join('\n')
    const nextComposeUrl = `https://mail.google.com/mail/?${new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: contactEmail,
      su: subject,
      body,
    }).toString()}`

    setComposeUrl(nextComposeUrl)
    setSubmittedName(name || 'there')
    window.open(nextComposeUrl, '_blank', 'noopener,noreferrer')
    event.currentTarget.reset()
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020202] text-white">
      <SeoJsonLd />
      <motion.div
        className="fixed left-0 top-0 z-50 h-1 w-full bg-[linear-gradient(90deg,#8f572a,#f2d39c,#c99355)] shadow-[0_0_24px_rgba(201,147,85,0.28)]"
        style={{ ...progressStyle, scaleX: scrollYProgress }}
        aria-hidden="true"
      />

      <Navigation
        mobileOpen={mobileOpen}
        scrollToSection={scrollToSection}
        setMobileOpen={setMobileOpen}
        shouldReduceMotion={shouldReduceMotion}
      />

      <Hero
        scrollToSection={scrollToSection}
        shouldReduceMotion={shouldReduceMotion}
      />

      <Services shouldReduceMotion={shouldReduceMotion} />
      <Portfolio shouldReduceMotion={shouldReduceMotion} />
      <Process shouldReduceMotion={shouldReduceMotion} />
      <Team shouldReduceMotion={shouldReduceMotion} />
      <Contact
        composeUrl={composeUrl}
        handleContactSubmit={handleContactSubmit}
        submittedName={submittedName}
        shouldReduceMotion={shouldReduceMotion}
      />
      <Footer scrollToSection={scrollToSection} />
      <FloatingActions
        scrollToTop={scrollToTop}
        shouldReduceMotion={shouldReduceMotion}
        showScrollTop={showScrollTop}
      />
    </main>
  )
}

function Navigation({
  mobileOpen,
  scrollToSection,
  setMobileOpen,
  shouldReduceMotion,
}: {
  mobileOpen: boolean
  scrollToSection: (target: string) => void
  setMobileOpen: (value: boolean) => void
  shouldReduceMotion: boolean | null
}) {
  return (
    <motion.header
      className="fixed left-0 right-0 top-0 z-40 px-4 py-4 sm:px-6"
      initial={shouldReduceMotion ? false : { opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: pageEase }}
      style={revealStyle}
    >
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between" aria-label="Main navigation">
        <button
          type="button"
          onClick={() => scrollToSection('home')}
          className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-full border-0 bg-transparent text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2d39c]"
          aria-label="The Code Forge home"
        >
          <CodeForgeMark />
          <span className="font-playfair text-[1.55rem] italic text-white">The Code Forge</span>
        </button>

        <div className="glass-nav absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full px-2 py-2 md:flex">
          {navItems.map((item) => (
            <motion.button
              key={item.target}
              type="button"
              onClick={() => scrollToSection(item.target)}
              className="min-h-9 cursor-pointer rounded-full border-0 bg-transparent px-4 py-1.5 text-[0.84rem] font-semibold text-white/72 transition-colors hover:bg-white/12 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2d39c]"
              whileHover={shouldReduceMotion ? undefined : { y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              transition={floatSpring}
            >
              {item.label}
            </motion.button>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={() => scrollToSection('contact')}
          className="premium-button hidden min-h-11 cursor-pointer rounded-full border-0 px-6 py-2.5 text-sm font-semibold transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2d39c] md:block"
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          transition={floatSpring}
        >
          Start Project
        </motion.button>

        <motion.button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="glass-nav grid h-11 w-11 cursor-pointer place-items-center rounded-full text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2d39c] md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
          transition={floatSpring}
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </motion.button>
      </nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="premium-surface mt-4 grid gap-2 rounded-[8px] p-3 md:hidden"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={shouldReduceMotion ? { duration: 0.01 } : spring}
            style={revealStyle}
          >
            {navItems.map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => scrollToSection(item.target)}
                className="min-h-11 cursor-pointer rounded-[8px] border border-white/10 bg-white/[0.055] px-4 text-left text-sm font-semibold text-white/85 transition-colors hover:border-[#f2d39c]/30 hover:bg-white/[0.085]"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  )
}

function Hero({
  scrollToSection,
  shouldReduceMotion,
}: {
  scrollToSection: (target: string) => void
  shouldReduceMotion: boolean | null
}) {
  const heroRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -82])
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0.18])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, shouldReduceMotion ? 1 : 1.08])
  const heroActionsY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 42])

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-[92vh] w-full overflow-hidden bg-[#020202]"
      style={{ minHeight: '92dvh' }}
    >
      <motion.div
        className="hero-zoom absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        aria-hidden="true"
      />
      <RevealLayer image={BG_IMAGE_2} />
      <motion.div
        className="pointer-events-none absolute inset-0 z-20"
        style={{ scale: heroScale }}
        aria-hidden="true"
      >
        <div className="hero-grid h-full w-full" />
      </motion.div>
      <div className="hero-vignette absolute inset-0 z-30" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 z-30 h-40 bg-gradient-to-t from-[#070604] to-transparent" aria-hidden="true" />

      <motion.div
        className="pointer-events-none absolute left-0 right-0 top-[13%] z-30 flex flex-col items-center px-5 text-center"
        style={{ y: heroTextY, opacity: heroTextOpacity }}
      >
        <p
          className="hero-anim hero-fade mb-5 inline-flex rounded-full border border-white/14 bg-white/[0.07] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/78 backdrop-blur-md"
          style={{ animationDelay: '0.18s' }}
        >
          Selective Web Systems Studio
        </p>
        <h1 className="max-w-6xl text-white leading-[0.88]" aria-label="The Code Forge">
          <span
            className="hero-anim hero-reveal block font-playfair text-6xl font-normal italic text-white drop-shadow-[0_18px_60px_rgba(0,0,0,0.58)] sm:text-8xl md:text-9xl"
            style={{ animationDelay: '0.25s', letterSpacing: 0 }}
          >
            The Code Forge
          </span>
        </h1>
        <p
          className="hero-anim hero-fade mt-6 max-w-2xl text-sm leading-7 text-white/72 sm:text-base"
          style={{ animationDelay: '0.52s' }}
        >
          Interactive websites, portfolio systems, and high-trust web apps with the finish expected from
          serious brands.
        </p>
      </motion.div>

      <div
        className="hero-anim hero-fade premium-surface absolute bottom-16 left-6 z-30 hidden max-w-[332px] rounded-[8px] p-5 sm:block md:left-10"
        style={{ animationDelay: '0.7s' }}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          {['Web apps', 'Portfolios', 'Launch UX'].map((item) => (
            <div key={item} className="border-r border-white/10 last:border-r-0">
              <p className="text-[0.67rem] font-bold uppercase tracking-[0.16em] text-white/42">Forge</p>
              <p className="mt-2 text-sm font-semibold text-white">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        className="hero-anim hero-fade absolute bottom-10 left-5 right-5 z-30 flex max-w-full flex-col items-start gap-4 sm:bottom-20 sm:left-auto sm:right-10 sm:max-w-[338px] sm:gap-5 md:right-14"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
          A direct path from strategy to shipped interface: services, live references, founders, and a
          project brief flow ready for action.
        </p>
        <motion.div className="flex flex-wrap gap-3" style={{ y: heroActionsY }}>
          <motion.button
            type="button"
            onClick={() => scrollToSection('contact')}
            className="premium-button inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-0 px-7 py-3 text-sm font-bold transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2d39c]"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.025, y: -2 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
            transition={floatSpring}
          >
            Start Your Project
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </motion.button>
          <button
            type="button"
            onClick={() => scrollToSection('portfolio')}
            className="ghost-button min-h-11 cursor-pointer rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2d39c]"
          >
            View Our Work
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}

function Services({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <section id="services" className="section-shell">
      <SectionHeading
        eyebrow="Our Services"
        title="A build system for every digital layer."
        shouldReduceMotion={shouldReduceMotion}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 md:grid-cols-2 xl:grid-cols-4">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <Reveal key={service.title} delay={index * 0.06} shouldReduceMotion={shouldReduceMotion}>
              <motion.article
                className="premium-surface premium-interactive group relative min-h-[278px] rounded-[8px] p-6"
                whileHover={shouldReduceMotion ? undefined : { y: -9, scale: 1.012 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                transition={spring}
                style={revealStyle}
              >
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#f2d39c]/55 to-transparent" />
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[linear-gradient(135deg,#f2d39c,#c99355)] text-[#080604] shadow-lg shadow-[#c99355]/15">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-2xl font-semibold text-white">{service.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/66">{service.description}</p>
                <span className="absolute bottom-5 left-6 text-xs font-bold uppercase tracking-[0.14em] text-[#f2d39c] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Explore layer
                </span>
              </motion.article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

function Portfolio({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <section id="portfolio" className="section-shell">
      <SectionHeading
        eyebrow="Featured Work"
        title="Real showcases, framed like live terrain."
        shouldReduceMotion={shouldReduceMotion}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 lg:grid-cols-2">
        {works.map((work, index) => (
          <Reveal key={work.title} delay={index * 0.08} shouldReduceMotion={shouldReduceMotion}>
            <motion.a
              href={work.href}
              target="_blank"
              rel="noreferrer"
              className="premium-surface premium-interactive group block rounded-[8px] text-white no-underline"
              whileHover={shouldReduceMotion ? undefined : { y: -10, scale: 1.006 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
              transition={spring}
              style={revealStyle}
            >
              <div className="relative aspect-[1.82] overflow-hidden border-b border-white/10 bg-black">
                <img
                  src={work.image}
                  alt={`${work.title} preview`}
                  className="h-full w-full object-cover opacity-95 transition duration-700 ease-out group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/24 via-transparent to-white/[0.03]" />
              </div>
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    {work.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/12 bg-white/[0.055] px-3 py-1 text-xs font-semibold text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#f2d39c]">Portfolio reference</p>
                  <h3 className="mt-3 text-2xl font-semibold">{work.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/66">{work.description}</p>
                </div>
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-xl shadow-black/25 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                  <ExternalLink className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            </motion.a>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Process({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <section id="process" className="section-shell">
      <SectionHeading
        eyebrow="Process"
        title="From brief to launch, every step earns its place."
        shouldReduceMotion={shouldReduceMotion}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 lg:grid-cols-4">
        {processSteps.map((step, index) => (
          <Reveal key={step.title} delay={index * 0.07} shouldReduceMotion={shouldReduceMotion}>
            <article className="premium-surface premium-interactive relative min-h-[258px] rounded-[8px] p-6">
              <span className="font-playfair text-6xl italic text-[#f2d39c]/32">{index + 1}</span>
              <h3 className="mt-8 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/64">{step.copy}</p>
              <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#f2d39c]/65 to-transparent" />
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Team({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <section id="team" className="section-shell">
      <SectionHeading
        eyebrow="Meet Our Founders"
        title="Two full-stack builders, one shared forge."
        shouldReduceMotion={shouldReduceMotion}
      />
      <div className="mx-auto grid w-full max-w-5xl gap-5 px-5 md:grid-cols-2">
        {founders.map((founder, index) => (
          <Reveal key={founder.name} delay={index * 0.08} shouldReduceMotion={shouldReduceMotion}>
            <motion.article
              className="premium-surface premium-interactive group overflow-hidden rounded-[8px]"
              whileHover={shouldReduceMotion ? undefined : { y: -9, scale: 1.008 }}
              transition={spring}
              style={revealStyle}
            >
              <div className="relative h-80 overflow-hidden border-b border-white/10 bg-black">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className={`h-full w-full object-cover opacity-92 transition duration-700 ease-out group-hover:scale-[1.03] ${founder.imageClass}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f2d39c]">{founder.role}</p>
                <h3 className="mt-3 text-4xl font-semibold text-white">{founder.name}</h3>
                <p className="mt-4 text-sm leading-7 text-white/66">{founder.description}</p>
                <a
                  href={founder.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="ghost-button mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white no-underline transition-colors"
                >
                  View portfolio
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </motion.article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Contact({
  composeUrl,
  handleContactSubmit,
  submittedName,
  shouldReduceMotion,
}: {
  composeUrl: string
  handleContactSubmit: (event: FormEvent<HTMLFormElement>) => void
  submittedName: string
  shouldReduceMotion: boolean | null
}) {
  return (
    <section id="contact" className="section-shell pb-32">
      <SectionHeading
        eyebrow="Let's Work Together"
        title="Send a project brief into the forge."
        shouldReduceMotion={shouldReduceMotion}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal shouldReduceMotion={shouldReduceMotion}>
          <div className="grid gap-4">
            <ContactRow icon={Mail} title="Email">
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </ContactRow>
            <ContactRow icon={Phone} title="Phone">
              <a href="tel:+919781010283">{contactPhones[0]}</a>
              <a href="tel:+916280962201">{contactPhones[1]}</a>
            </ContactRow>
            <ContactRow icon={MapPin} title="Location">
              <span>India, remote-first delivery</span>
            </ContactRow>
            <div className="premium-surface rounded-[8px] p-5 text-sm leading-7 text-white/66">
              <div className="mb-3 inline-flex items-center gap-2 text-white">
                <Sparkles className="h-4 w-4 text-[#f2d39c]" aria-hidden="true" />
                What happens next
              </div>
              <p>
                The form opens Gmail with your details filled in, then keeps a confirmation here so the
                handoff stays clear.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} shouldReduceMotion={shouldReduceMotion}>
          <AnimatePresence mode="wait">
            {submittedName ? (
              <motion.div
                key="sent"
                className="premium-surface grid min-h-[520px] content-center rounded-[8px] p-6"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={shouldReduceMotion ? { duration: 0.01 } : spring}
                style={revealStyle}
              >
                <div className="grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(135deg,#f2d39c,#c99355)] text-[#080604]">
                  <Check className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-4xl font-semibold text-white">Thank you, {submittedName}.</h3>
                <p className="mt-5 max-w-xl text-sm leading-7 text-white/66">
                  Gmail opened with your project brief. Send it from there and The Code Forge will reply as fast as possible.
                </p>
                {composeUrl ? (
                  <a
                    href={composeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="premium-button mt-8 inline-flex min-h-12 w-fit items-center gap-2 rounded-full px-6 text-sm font-bold no-underline"
                  >
                    Open Gmail Again
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleContactSubmit}
                className="premium-surface grid gap-4 rounded-[8px] p-5 sm:p-6"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={shouldReduceMotion ? { duration: 0.01 } : spring}
                style={revealStyle}
              >
                <Field label="Name" name="name" autoComplete="name" required />
                <Field label="Email" name="email" type="email" autoComplete="email" required />
                <Field label="Phone Number" name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" />
                <label className="grid gap-2 text-sm font-semibold text-white/85">
                  Message
                  <textarea
                    name="message"
                    rows={6}
                    className="min-h-40 resize-y rounded-[8px] border border-white/12 bg-black/55 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#f2d39c]/70"
                    placeholder="Tell us about your project..."
                    required
                  />
                </label>
                <motion.button
                  type="submit"
                  className="premium-button inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-7 text-sm font-bold"
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                  transition={floatSpring}
                >
                  Send Message
                  <Send className="h-4 w-4" aria-hidden="true" />
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  )
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  shouldReduceMotion,
}: {
  eyebrow: string
  title: string
  copy?: string
  shouldReduceMotion: boolean | null
}) {
  return (
    <Reveal shouldReduceMotion={shouldReduceMotion}>
      <div className="mx-auto mb-14 max-w-4xl px-5 text-center">
        <p className="section-eyebrow justify-center">{eyebrow}</p>
        <h2 className="mt-5 font-playfair text-4xl font-normal italic leading-[0.93] text-white sm:text-6xl">
          {title}
        </h2>
        {copy ? (
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">{copy}</p>
        ) : null}
      </div>
    </Reveal>
  )
}

function Reveal({
  children,
  delay = 0,
  shouldReduceMotion,
}: {
  children: ReactNode
  delay?: number
  shouldReduceMotion: boolean | null
}) {
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={shouldReduceMotion ? { duration: 0 } : { ...spring, delay }}
      style={revealStyle}
    >
      {children}
    </motion.div>
  )
}

function ContactRow({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode
  icon: LucideIcon
  title: string
}) {
  return (
    <div className="premium-surface grid grid-cols-[48px_1fr] gap-4 rounded-[8px] p-5">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-[linear-gradient(135deg,#f2d39c,#c99355)] text-[#080604]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="mt-2 grid gap-1 text-sm text-white/66 [&_a]:text-white/78 [&_a]:no-underline [&_a:hover]:text-white">
          {children}
        </div>
      </div>
    </div>
  )
}

function Field({
  autoComplete,
  label,
  name,
  placeholder,
  required = false,
  type = 'text',
}: {
  autoComplete?: string
  label: string
  name: string
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-white/85">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder ?? (label === 'Name' ? 'Your name' : 'your@email.com')}
        required={required}
        className="min-h-12 rounded-[8px] border border-white/12 bg-black/55 px-4 text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#f2d39c]/70"
      />
    </label>
  )
}

function FloatingActions({
  scrollToTop,
  shouldReduceMotion,
  showScrollTop,
}: {
  scrollToTop: () => void
  shouldReduceMotion: boolean | null
  showScrollTop: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.div
            className="premium-surface w-[292px] rounded-[8px]"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            transition={shouldReduceMotion ? { duration: 0.01 } : spring}
            style={revealStyle}
          >
            <div className="border-b border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/50">
              WhatsApp options
            </div>
            {floatingContacts.map((contact) => (
              <a
                key={contact.name}
                href={contact.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 border-b border-white/8 px-4 py-3 text-white no-underline transition-colors last:border-b-0 hover:bg-white/[0.065]"
              >
                <span className="h-11 w-11 overflow-hidden rounded-full bg-white/10">
                  <img src={contact.image} alt={contact.name} className={`h-full w-full object-cover ${contact.imageClass}`} />
                </span>
                <span className="grid">
                  <span className="text-sm font-semibold">{contact.name}</span>
                  <span className="text-xs text-white/50">{contact.role}</span>
                </span>
              </a>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {showScrollTop ? (
          <ScrollTopButton
            onClick={scrollToTop}
            shouldReduceMotion={shouldReduceMotion}
          />
        ) : null}
      </AnimatePresence>
      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="premium-button grid h-14 w-14 cursor-pointer place-items-center rounded-full border-0"
        aria-label="WhatsApp The Code Forge"
        aria-expanded={open}
        whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.04 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
        transition={floatSpring}
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <WhatsAppIcon className="h-6 w-6" aria-hidden="true" />}
      </motion.button>
    </div>
  )
}

function ScrollTopButton({
  onClick,
  shouldReduceMotion,
}: {
  onClick: () => void
  shouldReduceMotion: boolean | null
}) {
  const iconRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (shouldReduceMotion || !iconRef.current) {
      return
    }

    const animation = animate(iconRef.current, {
      rotate: [-18, 0],
      scale: [0.86, 1],
      duration: 520,
      ease: 'outCubic',
    })

    return () => {
      animation.revert()
    }
  }, [shouldReduceMotion])

  return (
    <motion.a
      href="#home"
      onClick={onClick}
      className="glass-nav grid h-12 w-12 cursor-pointer place-items-center rounded-full text-white"
      aria-label="Scroll to top"
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.88 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.9 }}
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
      transition={floatSpring}
      style={revealStyle}
    >
      <span ref={iconRef} className="pointer-events-none grid place-items-center">
        <ArrowUp className="h-5 w-5" aria-hidden="true" />
      </span>
    </motion.a>
  )
}

function Footer({ scrollToSection }: { scrollToSection: (target: string) => void }) {
  return (
    <footer className="border-t border-white/10 bg-[#020202] px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm text-white/56 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => scrollToSection('home')}
          className="inline-flex w-fit cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-white"
        >
          <CodeForgeMark />
          <span className="font-playfair text-2xl italic">The Code Forge</span>
        </button>
        <p>Modern websites, web applications, and digital experiences for startups, creators and businesses.</p>
      </div>
    </footer>
  )
}

function RevealLayer({ image }: { image: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const revealRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const reveal = revealRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context || !reveal) {
      return
    }

    const mouse = { x: -999, y: -999 }
    const smooth = { x: -999, y: -999 }
    let rafId: number | null = null

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawMask = (x: number, y: number) => {
      context.clearRect(0, 0, canvas.width, canvas.height)

      const gradient = context.createRadialGradient(x, y, 0, x, y, SPOTLIGHT_R)
      gradient.addColorStop(0, 'rgba(255,255,255,1)')
      gradient.addColorStop(0.4, 'rgba(255,255,255,1)')
      gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)')
      gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)')
      gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')

      context.fillStyle = gradient
      context.beginPath()
      context.arc(x, y, SPOTLIGHT_R, 0, Math.PI * 2)
      context.fill()

      const maskImage = `url(${canvas.toDataURL()})`
      reveal.style.maskImage = maskImage
      reveal.style.webkitMaskImage = maskImage
    }

    const tick = () => {
      smooth.x += (mouse.x - smooth.x) * 0.1
      smooth.y += (mouse.y - smooth.y) * 0.1
      drawMask(smooth.x, smooth.y)

      if (Math.abs(mouse.x - smooth.x) > 0.5 || Math.abs(mouse.y - smooth.y) > 0.5) {
        rafId = window.requestAnimationFrame(tick)
      } else {
        smooth.x = mouse.x
        smooth.y = mouse.y
        drawMask(smooth.x, smooth.y)
        rafId = null
      }
    }

    const startLoop = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick)
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      mouse.x = event.clientX
      mouse.y = event.clientY

      if (smooth.x < -900 || smooth.y < -900) {
        smooth.x = mouse.x
        smooth.y = mouse.y
        drawMask(smooth.x, smooth.y)
      }

      startLoop()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('pointermove', handlePointerMove)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('pointermove', handlePointerMove)

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <div
        ref={revealRef}
        className="pointer-events-none absolute inset-0 z-30 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${image})`,
          maskImage: TRANSPARENT_MASK,
          WebkitMaskImage: TRANSPARENT_MASK,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
        }}
        aria-hidden="true"
      />
    </>
  )
}

function CodeForgeMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff" aria-hidden="true">
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
    </svg>
  )
}

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function SeoJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'The Code Forge',
    description:
      'The Code Forge builds modern websites, web applications, e-commerce solutions and digital experiences for startups, creators and businesses.',
    email: contactEmail,
    telephone: ['+919781010283', '+916280962201'],
    founder: founders.map((founder) => ({ '@type': 'Person', name: founder.name })),
    sameAs: [jaskaranPortfolio, manijitPortfolio, 'https://www.instagram.com/_.codeforge._/'],
    serviceType: services.map((service) => service.title),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

export default App
