import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, ExternalLink } from 'lucide-react'

const projects = [
  {
    title: 'Kepler-10b Detection',
    tag: 'Signal Processing',
    span: 'md:col-span-7',
    aspect: 'aspect-[4/3]',
    desc: 'Detrended and phase-folded 9 years of Kepler photometry to confirm the 0.84-day orbit of the first confirmed rocky exoplanet.',
    image: null,
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
  },
  {
    title: 'Kepler-22b Analysis',
    tag: 'Habitable Zone',
    span: 'md:col-span-5',
    aspect: 'aspect-[4/5]',
    desc: 'Classified a 289.9-day transit signal in the habitable zone of a Sun-like star 600 light-years away.',
    image: null,
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4',
  },
  {
    title: 'Phase-Fold Pipeline',
    tag: 'Feature Engineering',
    span: 'md:col-span-5',
    aspect: 'aspect-[4/5]',
    desc: 'Built an automated Lomb-Scargle + phase-folding pipeline that extracts 20+ engineered features from raw stellar flux data.',
    image: null,
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4',
  },
  {
    title: 'ML Classification Model',
    tag: 'Ensemble Learning',
    span: 'md:col-span-7',
    aspect: 'aspect-[4/3]',
    desc: 'Achieved 0.96 ROC-AUC using Random Forest + XGBoost ensemble, validated against confirmed Kepler planets like Kepler-186f and Kepler-62f.',
    image: null,
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4',
  },
]

export default function SelectedWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="work" className="bg-bg py-12 md:py-16">
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
              <span className="text-xs text-muted uppercase tracking-[0.3em]">Selected Work</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight">
              Featured{' '}
              <span className="font-display italic">projects</span>
            </h2>
            <p className="text-sm text-muted mt-3 max-w-md">
              A selection of exoplanet detection projects built with Kepler data, machine learning, and a lot of curiosity.
            </p>
          </div>
          <motion.a
            href="#contact"
            className="hidden md:inline-flex items-center gap-2 text-sm text-muted hover:text-text-primary rounded-full px-5 py-2.5 border border-stroke hover:border-[#89AACC] transition-colors mt-4 md:mt-0"
            whileHover={{ scale: 1.02 }}
          >
            View all work
            <ArrowRight size={14} />
          </motion.a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              className={`${project.span} bg-surface border border-stroke rounded-3xl overflow-hidden group cursor-pointer`}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.1 }}
            >
              <div className={`relative ${project.aspect} overflow-hidden`}>
                {project.video && (
                  <video
                    src={project.video}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                )}

                <div
                  className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                    backgroundSize: '4px 4px',
                  }}
                />

                <div className="absolute inset-0 bg-bg/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-lg flex items-center justify-center">
                  <div className="rounded-full px-5 py-2 bg-white text-bg text-sm font-medium flex items-center gap-2">
                    View{' '}
                    <span className="font-display italic">— {project.title}</span>
                    <ExternalLink size={14} />
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <span className="text-[10px] text-muted uppercase tracking-[0.2em]">{project.tag}</span>
                <h3 className="text-base md:text-lg text-text-primary mt-1">{project.title}</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">{project.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
