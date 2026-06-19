import type { ReactNode } from 'react'
import { ArrowUp, Code2, ExternalLink, MessageCircle, Send } from 'lucide-react'
import { motion } from 'motion/react'

type FooterLink = {
  label: string
  target: string
}

type FounderLink = {
  name: string
  portfolio: string
}

type CinematicFooterProps = {
  links: FooterLink[]
  founders: FounderLink[]
  onNavigate: (target: string) => void
}

const whatsappUrl =
  'https://wa.me/?text=Hi%20The%20Code%20Forge%2C%20I%20want%20a%20website%20consultation.'

export function CinematicFooter({
  links,
  founders,
  onNavigate,
}: CinematicFooterProps) {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="cinematic-footer-wrap relative min-h-screen overflow-hidden border-t border-white/10">
      <footer className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#050609] px-5 py-12 text-white sm:px-8 lg:px-10">
        <div className="footer-aurora" aria-hidden="true" />
        <div className="liquid-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="footer-giant-text" aria-hidden="true">
          CODEFORGE
        </div>

        <div className="footer-marquee" aria-hidden="true">
          <div className="footer-marquee-track">
            <MarqueeItems />
            <MarqueeItems />
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center pt-24 text-center">
          <p className="eyebrow">
            <Code2 className="h-4 w-4" aria-hidden="true" />
            Premium digital builds
          </p>
          <h2 className="footer-glow-text mt-8 max-w-5xl text-5xl font-black leading-[0.92] md:text-8xl">
            Ready to build?
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Bring the idea. We will shape the strategy, interface, development,
            and launch path for a business-ready digital experience.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <MagneticPill href={whatsappUrl} primary>
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              WhatsApp Consultation
            </MagneticPill>
            <MagneticPill href="mailto:thecodeforgee@gmail.com">
              <Send className="h-5 w-5" aria-hidden="true" />
              Send Project Brief
            </MagneticPill>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {links.map((link) => (
              <button
                key={link.target}
                type="button"
                onClick={() => onNavigate(link.target)}
                className="footer-glass-pill min-h-11 cursor-pointer rounded-full px-5 text-sm font-bold text-slate-300 hover:text-white"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 border-t border-white/10 pt-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
            The Code Forge, 2026
          </p>

          <div className="footer-glass-pill flex flex-wrap items-center justify-center gap-3 rounded-full px-5 py-3">
            {founders.map((founder) => (
              <a
                key={founder.name}
                href={founder.portfolio}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-black text-white"
              >
                {founder.name}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollTop}
            aria-label="Back to top"
            className="footer-glass-pill ml-auto grid h-12 w-12 cursor-pointer place-items-center rounded-full text-slate-200"
          >
            <ArrowUp className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  )
}

function MagneticPill({
  href,
  children,
  primary = false,
}: {
  href: string
  children: ReactNode
  primary?: boolean
}) {
  return (
    <motion.a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      className={`footer-glass-pill inline-flex min-h-14 items-center gap-3 rounded-full px-8 text-sm font-black md:text-base ${
        primary ? 'text-white shadow-2xl shadow-red-950/40' : 'text-slate-200'
      }`}
    >
      {children}
    </motion.a>
  )
}

function MarqueeItems() {
  return (
    <div className="flex items-center gap-10 px-5">
      <span>Business Websites</span>
      <Code2 className="h-4 w-4 text-red-300" aria-hidden="true" />
      <span>Web Applications</span>
      <Code2 className="h-4 w-4 text-sky-300" aria-hidden="true" />
      <span>E-Commerce</span>
      <Code2 className="h-4 w-4 text-red-300" aria-hidden="true" />
      <span>SEO Foundations</span>
      <Code2 className="h-4 w-4 text-sky-300" aria-hidden="true" />
      <span>Conversion Design</span>
    </div>
  )
}
