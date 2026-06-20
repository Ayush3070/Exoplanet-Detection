import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import Hls from 'hls.js'
import { ExternalLink } from 'lucide-react'

const socials = [
  { name: 'Twitter', href: '#' },
  { name: 'LinkedIn', href: '#' },
  { name: 'Dribbble', href: '#' },
  { name: 'GitHub', href: '#' },
]

export default function ContactFooter() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const [year] = useState(new Date().getFullYear())

  useEffect(() => {
    if (!Hls.isSupported()) return
    const video = videoRef.current
    if (!video) return
    const hls = new Hls()
    hls.loadSource('https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8')
    hls.attachMedia(video)
    return () => hls.destroy()
  }, [])

  useEffect(() => {
    const el = marqueeRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.to(el, {
        xPercent: -50,
        duration: 40,
        ease: 'none',
        repeat: -1,
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="contact" className="bg-bg pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 scale-y-[-1]"
          />
        </div>
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      </div>

      <div className="relative z-10 mb-16 md:mb-20 overflow-hidden">
        <div ref={marqueeRef} className="flex whitespace-nowrap">
          <span className="text-6xl md:text-8xl lg:text-9xl font-display italic text-white/10 tracking-tight">
            {'BUILDING THE FUTURE • '.repeat(10)}
          </span>
          <span className="text-6xl md:text-8xl lg:text-9xl font-display italic text-white/10 tracking-tight">
            {'BUILDING THE FUTURE • '.repeat(10)}
          </span>
        </div>
      </div>

      <div className="relative z-10 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <p className="text-xs text-muted uppercase tracking-[0.3em] mb-4">Get in touch</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight mb-6">
              Let&apos;s find the next{' '}
              <span className="font-display italic">world</span>
            </h2>
            <motion.a
              href="mailto:hello@exoplanet.dev"
              className="inline-flex items-center gap-2 text-sm text-text-primary rounded-full px-7 py-3.5 border border-stroke hover:border-[#89AACC] transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              hello@exoplanet.dev
              <ExternalLink size={14} />
            </motion.a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-stroke">
            <div className="flex items-center gap-6">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  className="text-xs text-muted hover:text-text-primary transition-colors"
                >
                  {s.name}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted">Available for projects</span>
            </div>

            <div className="text-xs text-muted">
              &copy; {year} Exoplanet Detector
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
