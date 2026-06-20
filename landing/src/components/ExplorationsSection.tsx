import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ExternalLink } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const items = [
  { id: 1, label: 'Transit Signal', video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4' },
  { id: 2, label: 'Phase-Folded Curve', video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4' },
  { id: 3, label: 'Feature Space', video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4' },
  { id: 4, label: 'Classification Map', video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4' },
  { id: 5, label: 'Orbital Mechanics', video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4' },
  { id: 6, label: 'Stellar Noise', video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4' },
]

const leftItems = items.filter((_, i) => i % 2 === 0)
const rightItems = items.filter((_, i) => i % 2 !== 0)

export default function ExplorationsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinRef.current,
        pinSpacing: false,
      })

      if (leftRef.current) {
        gsap.fromTo(
          leftRef.current.children,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.2,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              end: 'top 20%',
              scrub: 1,
            },
          }
        )

        gsap.to(leftRef.current, {
          y: () => -leftRef.current!.offsetHeight + window.innerHeight * 0.6,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }

      if (rightRef.current) {
        gsap.to(rightRef.current, {
          y: () => rightRef.current!.offsetHeight - window.innerHeight * 0.6,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="min-h-[300vh] bg-bg relative">
      <div ref={pinRef} className="h-screen sticky top-0 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute z-10 text-center">
          <div className="flex items-center gap-3 justify-center mb-4">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">Explorations</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight mb-3">
            Visual{' '}
            <span className="font-display italic">playground</span>
          </h2>
          <p className="text-sm text-muted max-w-md mx-auto mb-6">
            Interactive visualizations from the exoplanet detection pipeline — scroll through the data that reveals hidden worlds.
          </p>
          <motion.a
            href="#contact"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-text-primary rounded-full px-5 py-2.5 border border-stroke hover:border-[#89AACC] transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            View on Dribbble
            <ExternalLink size={14} />
          </motion.a>
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 h-full grid grid-cols-2 gap-12 md:gap-40 items-start pt-32">
            <div ref={leftRef} className="space-y-12 md:space-y-24 mt-20">
              {leftItems.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square max-w-[320px] rounded-3xl overflow-hidden border border-stroke bg-surface mx-auto"
                  style={{ transform: `rotate(${item.id % 2 === 0 ? 2 : -2}deg)` }}
                >
                  <video
                    src={item.video}
                    className="w-full h-full object-cover"
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] text-white/80 bg-black/50 px-3 py-1 rounded-full">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div ref={rightRef} className="space-y-12 md:space-y-24 mt-40">
              {rightItems.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square max-w-[320px] rounded-3xl overflow-hidden border border-stroke bg-surface mx-auto relative"
                  style={{ transform: `rotate(${item.id % 2 === 0 ? 2 : -2}deg)` }}
                >
                  <video
                    src={item.video}
                    className="w-full h-full object-cover"
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] text-white/80 bg-black/50 px-3 py-1 rounded-full">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
