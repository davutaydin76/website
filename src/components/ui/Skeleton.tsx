import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800',
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6">
      <Skeleton className="w-12 h-12 rounded-xl mb-4" />
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6 mt-1" />
    </div>
  )
}

export function SkeletonMachineCard() {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-2/3 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5 mt-1" />
        </div>
        <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonGalleryItem() {
  return (
    <div className="break-inside-avoid mb-4">
      <Skeleton className="w-full h-48 rounded-2xl" />
    </div>
  )
}

export function SkeletonVideoItem() {
  return (
    <div className="rounded-2xl overflow-hidden">
      <Skeleton className="w-full aspect-video rounded-2xl" />
    </div>
  )
}

export function SkeletonHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-neutral-900">
      <div className="text-center px-4 w-full max-w-4xl mx-auto">
        <Skeleton className="h-4 w-32 mx-auto mb-6 bg-neutral-700" />
        <Skeleton className="h-14 w-full mb-3 bg-neutral-700" />
        <Skeleton className="h-14 w-3/4 mx-auto mb-6 bg-neutral-700" />
        <Skeleton className="h-6 w-2/3 mx-auto mb-2 bg-neutral-700" />
        <Skeleton className="h-6 w-1/2 mx-auto mb-10 bg-neutral-700" />
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-12 w-40 rounded-full bg-neutral-700" />
          <Skeleton className="h-12 w-36 rounded-full bg-neutral-700" />
        </div>
      </div>
    </section>
  )
}
