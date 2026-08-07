import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'

interface ScrollObject {
  id: string
  type: 'gear' | 'bolt' | 'lathe' | 'caliper' | 'profile'
  initialX: number
  initialY: number
  size: number
  rotateSpeed: number
  parallaxFactor: number
}

const objects: ScrollObject[] = [
  { id: 'gear-1', type: 'gear', initialX: 85, initialY: 15, size: 80, rotateSpeed: 1, parallaxFactor: 0.3 },
  { id: 'bolt-1', type: 'bolt', initialX: 10, initialY: 25, size: 40, rotateSpeed: -0.5, parallaxFactor: 0.5 },
  { id: 'lathe-1', type: 'lathe', initialX: 75, initialY: 45, size: 100, rotateSpeed: 0.3, parallaxFactor: 0.2 },
  { id: 'caliper-1', type: 'caliper', initialX: 15, initialY: 60, size: 70, rotateSpeed: -0.2, parallaxFactor: 0.4 },
  { id: 'profile-1', type: 'profile', initialX: 90, initialY: 75, size: 60, rotateSpeed: 0.4, parallaxFactor: 0.35 },
  { id: 'bolt-2', type: 'bolt', initialX: 50, initialY: 85, size: 30, rotateSpeed: 0.6, parallaxFactor: 0.6 },
]

function GearIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="text-neutral-300 dark:text-neutral-700">
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect
          key={angle}
          x="46"
          y="8"
          width="8"
          height="16"
          rx="2"
          fill="currentColor"
          opacity="0.5"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
    </svg>
  )
}

function BoltIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 80" fill="none" className="text-neutral-300 dark:text-neutral-700">
      <polygon points="20,0 35,10 35,20 5,20 5,10" fill="currentColor" opacity="0.4" />
      <rect x="12" y="20" width="16" height="50" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="10" y="65" width="20" height="4" rx="1" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function LatheIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 60" fill="none" className="text-neutral-300 dark:text-neutral-700">
      <rect x="5" y="25" width="110" height="20" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <circle cx="30" cy="35" r="18" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <circle cx="30" cy="35" r="6" fill="currentColor" opacity="0.3" />
      <rect x="55" y="30" width="50" height="10" rx="2" fill="currentColor" opacity="0.2" />
    </svg>
  )
}

function CaliperIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 60" fill="none" className="text-neutral-300 dark:text-neutral-700">
      <path d="M10 50 L40 10 L45 15 L20 50 Z" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <path d="M70 50 L40 10 L35 15 L60 50 Z" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <line x1="25" y1="45" x2="55" y2="45" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
    </svg>
  )
}

function ProfileIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 80" fill="none" className="text-neutral-300 dark:text-neutral-700">
      <rect x="10" y="10" width="40" height="60" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <rect x="15" y="15" width="30" height="20" fill="currentColor" opacity="0.15" />
      <rect x="15" y="40" width="30" height="25" fill="currentColor" opacity="0.1" />
    </svg>
  )
}

function ObjectRenderer({ type, size }: { type: ScrollObject['type']; size: number }) {
  switch (type) {
    case 'gear': return <GearIcon size={size} />
    case 'bolt': return <BoltIcon size={size} />
    case 'lathe': return <LatheIcon size={size} />
    case 'caliper': return <CaliperIcon size={size} />
    case 'profile': return <ProfileIcon size={size} />
  }
}

function ScrollObjectItem({ obj, progress }: { obj: ScrollObject; progress: number }) {
  const rotate = progress * 360 * obj.rotateSpeed
  const y = progress * 100 * obj.parallaxFactor
  const scale = 1 + progress * 0.1 * obj.parallaxFactor
  const x = Math.sin(progress * Math.PI) * 20 * obj.parallaxFactor

  return (
    <motion.div
      className="absolute pointer-events-none opacity-30 dark:opacity-20"
      style={{
        left: `${obj.initialX}%`,
        top: `${obj.initialY}%`,
        transform: `translate(-50%, -50%) translateY(${y}px) translateX(${x}px) rotate(${rotate}deg) scale(${scale})`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 1 }}
    >
      <ObjectRenderer type={obj.type} size={obj.size} />
    </motion.div>
  )
}

export default function ScrollObjects() {
  const progress = useScrollProgress()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {objects.map((obj) => (
        <ScrollObjectItem key={obj.id} obj={obj} progress={progress} />
      ))}
    </div>
  )
}

export function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}
