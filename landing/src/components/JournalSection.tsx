import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const entries = [
  {
    slug: 'how-we-detect-exoplanets-with-machine-learning',
    title: 'How We Detect Exoplanets with Machine Learning',
    tag: 'ML Pipeline',
    readTime: '5 min read',
    date: 'Mar 2026',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
  },
  {
    slug: 'why-phase-folding-reveals-hidden-worlds',
    title: 'Why Phase-Folding Reveals Hidden Worlds',
    tag: 'Signal Processing',
    readTime: '4 min read',
    date: 'Feb 2026',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4',
  },
  {
    slug: 'random-forest-vs-xgboost-for-transit-classification',
    title: 'Random Forest vs XGBoost for Transit Classification',
    tag: 'Model Comparison',
    readTime: '7 min read',
    date: 'Jan 2026',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4',
  },
  {
    slug: 'kepler-186f-first-earth-sized-habitable-zone-planet',
    title: 'Kepler-186f: The First Earth-Sized Habitable Zone Planet',
    tag: 'Astronomy',
    readTime: '6 min read',
    date: 'Dec 2025',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4',
  },
]

export default function JournalSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="bg-bg py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16" ref={ref}>
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">Journal</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight">
              Recent{' '}
              <span className="font-display italic">thoughts</span>
            </h2>
            <p className="text-sm text-muted mt-3 max-w-md">
              Notes on exoplanet detection, machine learning pipelines, and the intersection of astronomy and code.
            </p>
          </div>
          <motion.a
            href="#contact"
            className="hidden md:inline-flex items-center gap-2 text-sm text-muted hover:text-text-primary rounded-full px-5 py-2.5 border border-stroke hover:border-[#89AACC] transition-colors mt-4 md:mt-0"
            whileHover={{ scale: 1.02 }}
          >
            View all thoughts
            <ArrowRight size={14} />
          </motion.a>
        </motion.div>

        <div className="flex flex-col gap-3 md:gap-4">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.slug}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 * i }}
            >
              <Link
                to={`/journal/${entry.slug}`}
                className="flex items-center gap-6 p-4 bg-surface/30 hover:bg-surface border border-stroke rounded-[40px] sm:rounded-full transition-colors group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0">
                  <video
                    src={entry.image}
                    className="w-full h-full object-cover"
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-muted uppercase tracking-[0.2em]">{entry.tag}</span>
                    <span className="text-[10px] text-muted/50">·</span>
                    <span className="text-[10px] text-muted/50">{entry.date}</span>
                  </div>
                  <h3 className="text-sm sm:text-base text-text-primary truncate group-hover:text-white transition-colors">
                    {entry.title}
                  </h3>
                </div>

                <div className="text-[10px] text-muted/50 shrink-0 hidden sm:block">{entry.readTime}</div>

                <ArrowRight size={14} className="text-muted/50 shrink-0 group-hover:text-text-primary transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
