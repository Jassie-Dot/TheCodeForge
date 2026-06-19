import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform, type SpringOptions } from 'motion/react'

import { cn } from '@/lib/utils'

type SpotlightProps = {
  className?: string
  size?: number
  springOptions?: SpringOptions
}

export function Spotlight({
  className,
  size = 260,
  springOptions = { bounce: 0, damping: 28, stiffness: 180 },
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null)

  const mouseX = useSpring(0, springOptions)
  const mouseY = useSpring(0, springOptions)
  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`)
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`)

  useEffect(() => {
    const parent = containerRef.current?.parentElement

    if (!parent) {
      return
    }

    parent.style.position = 'relative'
    parent.style.overflow = 'hidden'
    setParentElement(parent)
  }, [])

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) {
        return
      }

      const { left, top } = parentElement.getBoundingClientRect()
      mouseX.set(event.clientX - left)
      mouseY.set(event.clientY - top)
    },
    [mouseX, mouseY, parentElement],
  )

  useEffect(() => {
    if (!parentElement) {
      return
    }

    const show = () => setIsHovered(true)
    const hide = () => setIsHovered(false)

    parentElement.addEventListener('mousemove', handleMouseMove)
    parentElement.addEventListener('mouseenter', show)
    parentElement.addEventListener('mouseleave', hide)

    return () => {
      parentElement.removeEventListener('mousemove', handleMouseMove)
      parentElement.removeEventListener('mouseenter', show)
      parentElement.removeEventListener('mouseleave', hide)
    }
  }, [parentElement, handleMouseMove])

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops),transparent_76%)] blur-2xl transition-opacity duration-200',
        'from-cyan-200/35 via-emerald-300/20 to-rose-200/0',
        isHovered ? 'opacity-100' : 'opacity-0',
        className,
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
        willChange: 'opacity, transform',
      }}
    />
  )
}
