import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import Hls from 'hls.js'

const roles = ['Astronomer', 'Data Scientist', 'ML Engineer', 'Explorer']

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const blurRefs = useRef<(HTMLParagraphElement | HTMLDivElement)[]>([])
  const [roleIndex, setRoleIndex] = useState(0)

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
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ ease: 'power3.out' })
      tl.fromTo(
        nameRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
      )
      tl.fromTo(
        blurRefs.current,
        { opacity: 0, y: 20, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.1 },
        '-=0.6'
      )
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((i) => (i + 1) % roles.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])



  const addBlurRef = useCallback((el: HTMLParagraphElement | HTMLDivElement | null) => {
    if (el && !blurRefs.current.includes(el)) blurRefs.current.push(el)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col bg-bg overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2"
          />
        </div>
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
      </div>



      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p ref={addBlurRef} className="text-xs text-muted uppercase tracking-[0.3em] mb-8 blur-in">
          PROJECT &apos;26
        </p>

        <h1
          ref={nameRef}
          className="text-6xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6"
        >
          Exoplanet Detector
        </h1>

        <p className="text-sm md:text-base text-muted max-w-md mb-4" ref={addBlurRef}>
          A{' '}
          <span key={roleIndex} className="font-display italic text-text-primary inline-block animate-role-fade-in">
            {roles[roleIndex]}
          </span>{' '}
          building ML models that find worlds beyond our solar system.
        </p>

        <p className="text-sm md:text-base text-muted max-w-md mb-12" ref={addBlurRef}>
          Decoding Kepler light curves with Random Forest and XGBoost — every transit dip brings us closer to the next discovery.
        </p>

        <div className="inline-flex gap-4 flex-wrap justify-center">
          <motion.a
            href="#work"
            className="rounded-full text-sm px-7 py-3.5 bg-text-primary text-bg font-medium inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            See Works
          </motion.a>
          <motion.a
            href="#contact"
            className="rounded-full text-sm px-7 py-3.5 border-2 border-stroke bg-bg text-text-primary font-medium inline-block"
            whileHover={{ scale: 1.05 }}
          >
            Reach out&hellip;
          </motion.a>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center pb-8">
        <span className="text-xs text-muted uppercase tracking-[0.2em] mb-2">SCROLL</span>
        <div className="w-px h-10 bg-stroke relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-text-primary/30 animate-scroll-down" />
        </div>
      </div>
    </section>
  )
}
