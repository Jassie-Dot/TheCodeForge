import { type KeyboardEvent, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Grid3X3,
  X,
  ZoomIn,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

export type PortfolioItem = {
  title: string
  category: string
  description: string
  href: string
  metric: string
}

type PortfolioGalleryProps = {
  projects: PortfolioItem[]
}

export function PortfolioGallery({ projects }: PortfolioGalleryProps) {
  const [filter, setFilter] = useState('All')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((project) => project.category)))],
    [projects],
  )

  const filteredProjects =
    filter === 'All'
      ? projects
      : projects.filter((project) => project.category === filter)

  const selectedProject =
    selectedIndex === null ? null : filteredProjects[selectedIndex] ?? null

  const openProject = (index: number) => {
    setSelectedIndex(index)
  }

  const closeProject = () => {
    setSelectedIndex(null)
  }

  const showNext = () => {
    if (selectedIndex === null) return
    setSelectedIndex((selectedIndex + 1) % filteredProjects.length)
  }

  const showPrev = () => {
    if (selectedIndex === null) return
    setSelectedIndex((selectedIndex - 1 + filteredProjects.length) % filteredProjects.length)
  }

  const onCardKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openProject(index)
    }
  }

  return (
    <div aria-labelledby="portfolio-gallery-title">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="eyebrow">
            <Grid3X3 className="h-4 w-4" aria-hidden="true" />
            Portfolio Gallery
          </p>
          <h3 id="portfolio-gallery-title" className="mt-4 text-3xl font-black md:text-4xl">
            Selected public showcases, no invented client work.
          </h3>
        </div>

        <div
          className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1"
          role="group"
          aria-label="Portfolio categories"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setFilter(category)
                setSelectedIndex(null)
              }}
              aria-pressed={filter === category}
              className={`h-10 cursor-pointer rounded-xl px-4 text-sm font-black transition ${
                filter === category
                  ? 'bg-red-500 text-white shadow-lg shadow-red-950/30'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, index) => (
            <motion.article
              key={project.title}
              layout
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26, delay: index * 0.04 }}
              role="listitem"
            >
              <button
                type="button"
                onClick={() => openProject(index)}
                onKeyDown={(event) => onCardKeyDown(event, index)}
                className="group glass-panel relative block min-h-[360px] w-full cursor-pointer overflow-hidden p-0 text-left transition duration-300 hover:-translate-y-1 hover:border-red-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                aria-label={`View details for ${project.title}`}
              >
                <div className="relative aspect-[1.18] overflow-hidden border-b border-white/10">
                  <div className={`portfolio-preview portfolio-preview-${index % 3}`}>
                    <div className="preview-browser">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="preview-content">
                      <p>{project.category}</p>
                      <strong>{project.title}</strong>
                      <small>{project.metric}</small>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100">
                    <ZoomIn className="mb-3 h-8 w-8 text-red-100" aria-hidden="true" />
                    <span className="text-sm font-black text-white">View Showcase</span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm font-black text-red-200">{project.category}</p>
                  <h4 className="mt-2 text-2xl font-black text-white">{project.title}</h4>
                  <p className="mt-3 line-clamp-3 leading-7 text-slate-300">
                    {project.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-slate-100">
                    Details
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </button>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedProject ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/88 p-4 backdrop-blur-md"
            onClick={closeProject}
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-dialog-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 18 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
              className="glass-panel relative grid w-full max-w-5xl overflow-hidden p-0 lg:grid-cols-[1.05fr_0.95fr]"
            >
              <button
                type="button"
                onClick={closeProject}
                aria-label="Close portfolio dialog"
                className="absolute right-4 top-4 z-20 grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur transition hover:bg-white/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="relative min-h-[320px] overflow-hidden border-b border-white/10 lg:border-b-0 lg:border-r">
                <div className="portfolio-preview portfolio-preview-modal">
                  <div className="preview-browser">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="preview-content">
                    <p>{selectedProject.category}</p>
                    <strong>{selectedProject.title}</strong>
                    <small>{selectedProject.metric}</small>
                  </div>
                </div>
                {filteredProjects.length > 1 ? (
                  <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
                    <button
                      type="button"
                      onClick={showPrev}
                      aria-label="View previous showcase"
                      className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-white/10"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      aria-label="View next showcase"
                      className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-white/10"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="flex min-h-[320px] flex-col justify-between gap-8 p-6 md:p-8">
                <div>
                  <p className="eyebrow">{selectedProject.category}</p>
                  <h3 id="portfolio-dialog-title" className="mt-5 text-4xl font-black">
                    {selectedProject.title}
                  </h3>
                  <p className="mt-5 text-lg leading-8 text-slate-300">
                    {selectedProject.description}
                  </p>
                </div>
                <a
                  href={selectedProject.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary w-fit"
                >
                  Open Live Showcase
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
