import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/scroll/ScrollObjects'
import type { CounterSettings } from '@/types'

interface CountersProps {
  counters?: CounterSettings
}

export default function Counters({ counters }: CountersProps) {
  const { t } = useTranslation()
  const safeProjects = Number(counters?.projects) || 500
  const safeClients = Number(counters?.clients) || 150
  const safeCapacity = Number(counters?.capacity) || 98

  const items = [
    { value: safeProjects, label: t('counters.projects'), suffix: '+' },
    { value: safeClients, label: t('counters.clients'), suffix: '+' },
    { value: safeCapacity, label: t('counters.capacity'), suffix: '%' },
  ]

  return (
    <section className="section-padding bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-white border-y border-zinc-200 dark:border-zinc-900 transition-colors">
      <div className="container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="text-5xl sm:text-6xl font-bold mb-2 text-accent-600 dark:text-accent">
                <AnimatedCounter value={item.value} suffix={item.suffix} />
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
