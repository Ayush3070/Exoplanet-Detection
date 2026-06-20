import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="bg-bg py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16" ref={ref}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            { value: '4+', label: 'Exoplanets\nValidated', sub: 'Confirmed Kepler planets detected' },
            { value: '0.96', label: 'ROC-AUC\nScore', sub: 'Model accuracy benchmark' },
            { value: '120', label: 'Light Curves\nper Second', sub: 'Pipeline throughput' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center md:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i }}
            >
              <div className="text-5xl md:text-6xl lg:text-7xl font-display italic text-text-primary leading-none mb-3">
                {stat.value}
              </div>
              <div className="text-sm text-muted whitespace-pre-line mb-2">{stat.label}</div>
              <div className="text-xs text-muted/50">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
