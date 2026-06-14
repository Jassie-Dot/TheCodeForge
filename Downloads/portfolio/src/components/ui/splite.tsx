import { lazy, Suspense } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

type SplineSceneProps = {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-10 w-10 rounded-full border border-white/20 border-t-emerald-300 animate-spin" />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}
