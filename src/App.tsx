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
import { AiChatbot } from './components/ui/ai-chatbot'
import { contactEmail, contactPhones, submitContactForm } from './lib/contact'

const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85'
const BG_IMAGE_2 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85'

const SPOTLIGHT_R = 260
const TRANSPARENT_MASK = 'linear-gradient(transparent, transparent)'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    const name = String(formData.get('name') ?? '').trim()

    try {
      await submitContactForm(formData)
      setSubmittedName(name || 'there')
      form.reset()
    } catch (error) {
      console.error('Error submitting form', error)
    } finally {
      setIsSubmitting(false)
    }
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
        isSubmitting={isSubmitting}
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
      <AiChatbot />
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
      className="relative grid min-h-[760px] w-full overflow-hidden bg-[#020202] px-5 pb-28 pt-32 sm:min-h-[720px] sm:px-8 lg:min-h-[92vh] lg:px-12"
      style={{ minHeight: 'clamp(760px, 92dvh, 980px)' }}
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

      <div className="relative z-30 mx-auto grid h-full w-full max-w-[1440px] content-center gap-12 lg:gap-16">
        <motion.div
          className="grid justify-items-start gap-5 text-left sm:justify-items-center sm:text-center"
          style={{ y: heroTextY, opacity: heroTextOpacity }}
        >
          <p
            className="hero-anim hero-fade inline-flex rounded-full border border-white/14 bg-white/[0.07] px-4 py-2 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/78 backdrop-blur-md sm:text-[0.68rem]"
            style={{ animationDelay: '0.18s' }}
          >
            Selective Web Systems Studio
          </p>
          <h1 className="w-full lg:max-w-none text-white leading-[0.86]" aria-label="The Code Forge">
            <span
              className="hero-anim hero-reveal block font-playfair text-[clamp(3.35rem,13vw,8.75rem)] font-normal italic text-white drop-shadow-[0_18px_60px_rgba(0,0,0,0.58)] lg:whitespace-nowrap"
              style={{ animationDelay: '0.25s', letterSpacing: 0 }}
            >
              The Code Forge
            </span>
          </h1>
          <p
            className="hero-anim hero-fade max-w-[39rem] text-sm leading-7 text-white/78 sm:text-base"
            style={{ animationDelay: '0.58s' }}
          >
            Strategy, interface design, and responsive React builds arranged into one clean launch path for
            web apps, portfolios, and business platforms.
          </p>
        </motion.div>

        <motion.div
          className="hero-anim hero-fade flex flex-col items-center gap-8 justify-self-stretch sm:justify-self-center mt-4"
          style={{ y: heroActionsY, animationDelay: '0.78s' }}
        >
          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:gap-6">
            <motion.button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="premium-button inline-flex min-h-[3.25rem] cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-8 py-3 text-sm font-bold transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2d39c]"
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
              className="ghost-button min-h-[3.25rem] cursor-pointer rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2d39c]"
            >
              View Our Work
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/50 sm:gap-6">
            {['Web apps', 'Portfolios', 'Launch UX'].map((item, i) => (
              <div key={item} className="flex items-center gap-4 sm:gap-6">
                <span className="text-white/80">{item}</span>
                {i !== 2 && <div className="h-1 w-1 rounded-full bg-white/20" />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
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
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 sm:grid-cols-2 xl:grid-cols-4">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <Reveal key={service.title} delay={index * 0.06} shouldReduceMotion={shouldReduceMotion}>
              <motion.article
                className="premium-surface premium-interactive group relative grid min-h-[188px] grid-cols-[48px_1fr] gap-4 rounded-[8px] p-5 sm:min-h-[238px] sm:grid-cols-1 sm:p-6 xl:min-h-[278px]"
                whileHover={shouldReduceMotion ? undefined : { y: -9, scale: 1.012 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                transition={spring}
                style={revealStyle}
              >
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#f2d39c]/55 to-transparent" />
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[linear-gradient(135deg,#f2d39c,#c99355)] text-[#080604] shadow-lg shadow-[#c99355]/15">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-[1.35rem] font-semibold leading-tight text-white sm:mt-8 sm:text-2xl">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/66 sm:mt-4 sm:leading-7">{service.description}</p>
                  <span className="mt-5 hidden text-xs font-bold uppercase tracking-[0.14em] text-[#f2d39c] opacity-80 transition-opacity duration-300 sm:block sm:opacity-0 sm:group-hover:opacity-100">
                    Explore layer
                  </span>
                </div>
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
              className="premium-surface premium-interactive group grid overflow-hidden rounded-[8px] text-white no-underline lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)]"
              whileHover={shouldReduceMotion ? undefined : { y: -10, scale: 1.006 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
              transition={spring}
              style={revealStyle}
            >
              <div className="relative aspect-[1.35] overflow-hidden border-b border-white/10 bg-black sm:aspect-[1.7] lg:aspect-auto lg:min-h-[360px] lg:border-b-0 lg:border-r lg:border-white/10">
                <img
                  src={work.image}
                  alt={`${work.title} preview`}
                  className="h-full w-full object-contain opacity-95 transition duration-700 ease-out group-hover:scale-[1.018]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/24 via-transparent to-white/[0.03]" />
              </div>
              <div className="flex flex-col justify-between gap-5 p-5 sm:p-6">
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
                  <h3 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">{work.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/66">{work.description}</p>
                </div>
                <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-xl shadow-black/25 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 sm:inline-flex">
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
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-4">
        {processSteps.map((step, index) => (
          <Reveal key={step.title} delay={index * 0.07} shouldReduceMotion={shouldReduceMotion}>
            <article className="premium-surface premium-interactive relative min-h-[210px] rounded-[8px] p-5 sm:min-h-[258px] sm:p-6">
              <span className="font-playfair text-5xl italic text-[#f2d39c]/32 sm:text-6xl">{index + 1}</span>
              <h3 className="mt-5 text-xl font-semibold text-white sm:mt-8">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/64 sm:mt-4">{step.copy}</p>
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
              className="premium-surface premium-interactive group grid gap-5 overflow-hidden rounded-[8px] p-5 text-left sm:grid-cols-[132px_1fr] sm:items-center sm:p-6 md:grid-cols-1 md:p-8 md:text-center"
              whileHover={shouldReduceMotion ? undefined : { y: -9, scale: 1.008 }}
              transition={spring}
              style={revealStyle}
            >
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white/10 bg-black md:mx-auto md:h-48 md:w-48 lg:h-56 lg:w-56">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className={`h-full w-full object-cover opacity-92 transition duration-700 ease-out group-hover:scale-[1.03] ${founder.imageClass}`}
                />
              </div>
              <div className="flex flex-col items-start md:mt-8 md:items-center">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f2d39c]">{founder.role}</p>
                <h3 className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">{founder.name}</h3>
                <p className="mt-3 text-sm leading-7 text-white/66 md:mt-4">{founder.description}</p>
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
  isSubmitting,
  handleContactSubmit,
  submittedName,
  shouldReduceMotion,
}: {
  isSubmitting: boolean
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
                Your message will be sent securely and directly to our team. We'll receive it instantly and reply to you as fast as possible.
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
                  Your project brief has been successfully sent to our team. We will review it and get back to you as fast as possible.
                </p>
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
                  disabled={isSubmitting}
                  className="premium-button inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-7 text-sm font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                  whileHover={shouldReduceMotion || isSubmitting ? undefined : { scale: 1.015 }}
                  whileTap={shouldReduceMotion || isSubmitting ? undefined : { scale: 0.96 }}
                  transition={floatSpring}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  {!isSubmitting && <Send className="h-4 w-4" aria-hidden="true" />}
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
      <div className="mx-auto mb-10 max-w-4xl px-5 text-left sm:mb-14 sm:text-center">
        <p className="section-eyebrow justify-start sm:justify-center">{eyebrow}</p>
        <h2 className="mt-4 font-playfair text-[clamp(2.8rem,9vw,4.8rem)] font-normal italic leading-[0.94] text-white sm:mt-5">
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
        className="whatsapp-action inline-flex h-14 min-w-14 cursor-pointer items-center justify-center gap-2 rounded-full border-0 px-4 text-sm font-black"
        aria-label="WhatsApp The Code Forge"
        aria-expanded={open}
        whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.04 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
        transition={floatSpring}
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <WhatsAppIcon className="h-6 w-6" aria-hidden="true" />}
        <span className="hidden sm:inline">{open ? 'Close' : 'WhatsApp'}</span>
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
