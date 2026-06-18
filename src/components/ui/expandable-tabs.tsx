import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../../lib/utils'

export type ExpandableTab = {
  title: string
  icon: LucideIcon
  target: string
}

type ExpandableTabsProps = {
  tabs: ExpandableTab[]
  activeIndex: number
  onChange: (index: number) => void
  className?: string
}

export function ExpandableTabs({
  tabs,
  activeIndex,
  onChange,
  className,
}: ExpandableTabsProps) {
  return (
    <nav
      aria-label="Page sections"
      className={cn(
        'flex items-center gap-1 rounded-md border border-white/10 bg-black/[0.55] p-1 shadow-2xl shadow-black/30 backdrop-blur-xl',
        className,
      )}
    >
      {tabs.map((tab, index) => {
        const Icon = tab.icon
        const isActive = activeIndex === index

        return (
          <button
            key={tab.title}
            type="button"
            aria-label={tab.title}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(index)}
            className={cn(
              'relative grid h-11 min-w-11 cursor-pointer grid-cols-[20px_auto] items-center gap-2 rounded-md px-3 text-sm font-semibold text-white/[0.68] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300',
              isActive && 'text-white',
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="codeforge-active-tab"
                className="absolute inset-0 rounded-md border border-cyan-300/25 bg-white/[0.12]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            <Icon className="relative z-10 h-5 w-5" aria-hidden="true" />
            <span className="relative z-10 hidden sm:inline">{tab.title}</span>
          </button>
        )
      })}
    </nav>
  )
}
