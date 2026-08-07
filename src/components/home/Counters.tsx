import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/scroll/ScrollObjects'
import type { CounterSettings } from '@/types'

interface CountersProps {
  counters?: CounterSettings
}

export default function Counters({ counters }: CountersProps) {
  const { t } = useTranslation()
  const data = counters || { projects: 500, clients: 120, capacity: 95 }

  const items = [
    { value: data.projects, label: t('counters.projects'), suffix: '+' },
    { value: data.clients, label: t('counters.clients'), suffix: '+' },
    { value: data.capacity, label: t('counters.capacity'), suffix: '%' },
  ]

  return (
    <section className="section-padding bg-neutral-900 dark:bg-neutral-950 text-white">
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
              <div className="text-5xl sm:text-6xl font-bold mb-2 text-accent">
                <AnimatedCounter value={item.value} suffix={item.suffix} />
              </div>
              <p className="text-neutral-400 text-lg">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
